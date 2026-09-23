package com.example.atlex.domain.github.service;

import com.example.atlex.domain.github.client.GitHubApiClient;
import com.example.atlex.domain.github.dto.response.GitHubSyncLogResponse;
import com.example.atlex.domain.github.entity.*;
import com.example.atlex.domain.github.exception.GitHubApiException;
import com.example.atlex.domain.github.repository.GitHubSyncConfigRepository;
import com.example.atlex.domain.github.repository.GitHubSyncLogRepository;
import com.example.atlex.domain.github.util.AesEncryptionUtils;
import com.example.atlex.domain.github.util.FrontmatterUtils;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.tag.repository.PostTagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 게시글 변경 사항을 사용자의 GitHub 저장소로 자동 커밋·푸시하는 동기화 및 재시도 서비스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GitHubSyncService {

    private final GitHubApiClient gitHubApiClient;
    private final GitHubSyncConfigRepository gitHubSyncConfigRepository;
    private final GitHubSyncLogRepository gitHubSyncLogRepository;
    private final PostRepository postRepository;
    private final PostTagRepository postTagRepository;

    @Value("${github.encryption-key:atlex-default-github-encrypt-key-32b!}")
    private String encryptionKey;

    /**
     * 게시글 발행 및 수정 시 GitHub 저장소에 .md 파일을 자동 커밋·푸시합니다.
     */
    @Transactional
    public void syncPost(Long postId, Long userId, SyncType syncType) {
        Optional<GitHubSyncConfig> configOpt = gitHubSyncConfigRepository.findByUser_Id(userId);
        if (configOpt.isEmpty()) {
            return;
        }

        GitHubSyncConfig config = configOpt.get();
        if (!Boolean.TRUE.equals(config.getIsEnabled()) || config.getRepositoryName() == null
            || config.getRepositoryName().isBlank()) {
            return;
        }

        Post post = postRepository.findWithUserById(postId).orElse(null);
        if (post == null) {
            log.warn("GitHub 동기화 대상 게시글을 찾을 수 없음: postId={}", postId);
            return;
        }

        List<String> tags = postTagRepository.findTagNamesByPostId(postId);
        String markdown = FrontmatterUtils.buildMarkdown(post, tags);
        String filename = FrontmatterUtils.generateSafeFilename(postId, post.getTitle());
        String fullPath = config.getDirectoryPath() + filename;

        String commitMessage = String.format("docs: %s '%s' [Atlex Sync]",
            syncType == SyncType.CREATE ? "publish" : "update",
            post.getTitle());

        config.startSync();

        try {
            String rawToken = AesEncryptionUtils.decrypt(config.getEncryptedAccessToken(), encryptionKey);

            // 제목 변경 등으로 이전 동기화 경로와 달라진 경우 이전 파일 정리
            Optional<GitHubSyncLog> lastSuccessLog = gitHubSyncLogRepository
                .findTopByUserIdAndPostIdAndStatusOrderByCreatedAtDesc(userId, postId, SyncLogStatus.SUCCESS);
            if (lastSuccessLog.isPresent()) {
                String previousPath = lastSuccessLog.get().getTargetPath();
                if (previousPath != null && !previousPath.equals(fullPath)) {
                    try {
                        Optional<String> prevSha = gitHubApiClient.getFileSha(
                            rawToken,
                            config.getRepositoryName(),
                            previousPath,
                            config.getBranchName());
                        if (prevSha.isPresent()) {
                            gitHubApiClient.deleteFile(
                                rawToken,
                                config.getRepositoryName(),
                                previousPath,
                                config.getBranchName(),
                                String.format("docs: rename/delete old file for '%s' [Atlex Sync]", post.getTitle()),
                                prevSha.get(),
                                config.getGithubUsername(),
                                config.getGithubEmail());
                            log.info("이전 백업 파일 정리 완료: previousPath={}", previousPath);
                        }
                    } catch (Exception e) {
                        log.warn("이전 파일 정리 실패 (새 파일 커밋은 계속 진행): {}", e.getMessage());
                    }
                }
            }

            Optional<String> existingSha = gitHubApiClient.getFileSha(
                rawToken,
                config.getRepositoryName(),
                fullPath,
                config.getBranchName());

            String commitSha = gitHubApiClient.createOrUpdateFile(
                rawToken,
                config.getRepositoryName(),
                fullPath,
                config.getBranchName(),
                commitMessage,
                markdown,
                existingSha.orElse(null),
                config.getGithubUsername(),
                config.getGithubEmail());

            config.recordSyncSuccess();

            GitHubSyncLog syncLog = GitHubSyncLog.builder()
                .userId(userId)
                .postId(postId)
                .postTitle(post.getTitle())
                .syncType(syncType)
                .targetPath(fullPath)
                .status(SyncLogStatus.SUCCESS)
                .commitSha(commitSha)
                .build();
            gitHubSyncLogRepository.save(syncLog);

            log.info("GitHub 자동 백업 성공: user={}, repo={}, file={}, sha={}",
                config.getGithubUsername(), config.getRepositoryName(), fullPath, commitSha);
        } catch (Exception e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : "알 수 없는 오류";
            config.recordSyncFailure(errorMsg);

            GitHubSyncLog failLog = GitHubSyncLog.builder()
                .userId(userId)
                .postId(postId)
                .postTitle(post.getTitle())
                .syncType(syncType)
                .targetPath(fullPath)
                .status(SyncLogStatus.FAILED)
                .errorMessage(errorMsg)
                .build();
            gitHubSyncLogRepository.save(failLog);

            log.error("GitHub 자동 백업 실패: user={}, repo={}, file={}, reason={}",
                config.getGithubUsername(), config.getRepositoryName(), fullPath, errorMsg);
        }
    }

    /**
     * 게시글 삭제 시 사용자의 설정(DeleteOption)에 따라 GitHub 저장소 내 파일을 삭제 커밋합니다.
     */
    @Transactional
    public void syncDeletePost(Long postId, String postTitle, Long userId) {
        Optional<GitHubSyncConfig> configOpt = gitHubSyncConfigRepository.findByUser_Id(userId);
        if (configOpt.isEmpty()) {
            return;
        }

        GitHubSyncConfig config = configOpt.get();
        if (!Boolean.TRUE.equals(config.getIsEnabled()) || config.getRepositoryName() == null
            || config.getRepositoryName().isBlank()) {
            return;
        }

        if (config.getDeleteOption() != DeleteOption.DELETE_FILE) {
            log.info("게시글 삭제 옵션이 KEEP_FILE이므로 GitHub 파일 유지를 선택함: postId={}", postId);
            return;
        }

        String filename = FrontmatterUtils.generateSafeFilename(postId, postTitle);
        String fullPath = config.getDirectoryPath() + filename;
        String commitMessage = String.format("docs: delete '%s' [Atlex Sync]", postTitle);

        config.startSync();

        try {
            String rawToken = AesEncryptionUtils.decrypt(config.getEncryptedAccessToken(), encryptionKey);
            Optional<String> existingSha = gitHubApiClient.getFileSha(
                rawToken,
                config.getRepositoryName(),
                fullPath,
                config.getBranchName());

            if (existingSha.isPresent()) {
                String commitSha = gitHubApiClient.deleteFile(
                    rawToken,
                    config.getRepositoryName(),
                    fullPath,
                    config.getBranchName(),
                    commitMessage,
                    existingSha.get(),
                    config.getGithubUsername(),
                    config.getGithubEmail());

                config.recordSyncSuccess();

                GitHubSyncLog syncLog = GitHubSyncLog.builder()
                    .userId(userId)
                    .postId(postId)
                    .postTitle(postTitle)
                    .syncType(SyncType.DELETE)
                    .targetPath(fullPath)
                    .status(SyncLogStatus.SUCCESS)
                    .commitSha(commitSha)
                    .build();
                gitHubSyncLogRepository.save(syncLog);

                log.info("GitHub 파일 삭제 동기화 성공: repo={}, file={}, sha={}",
                    config.getRepositoryName(), fullPath, commitSha);
            } else {
                config.recordSyncSuccess();
                log.info("GitHub 저장소에 삭제 대상 파일이 이미 없음: {}", fullPath);
            }
        } catch (Exception e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : "삭제 커밋 오류";
            config.recordSyncFailure(errorMsg);

            GitHubSyncLog failLog = GitHubSyncLog.builder()
                .userId(userId)
                .postId(postId)
                .postTitle(postTitle)
                .syncType(SyncType.DELETE)
                .targetPath(fullPath)
                .status(SyncLogStatus.FAILED)
                .errorMessage(errorMsg)
                .build();
            gitHubSyncLogRepository.save(failLog);

            log.error("GitHub 파일 삭제 커밋 실패: {}", fullPath, e);
        }
    }

    /**
     * 실패한 동기화 로그 건에 대해 수동 재시도를 실행합니다.
     */
    @Transactional
    public GitHubSyncLogResponse retrySync(Long logId, Long userId) {
        GitHubSyncLog logItem = gitHubSyncLogRepository.findByIdAndUserId(logId, userId)
            .orElseThrow(() -> new GitHubApiException("재시도할 동기화 로그를 찾을 수 없습니다."));

        if (logItem.getSyncType() == SyncType.DELETE) {
            syncDeletePost(logItem.getPostId(), logItem.getPostTitle(), userId);
        } else {
            syncPost(logItem.getPostId(), userId, logItem.getSyncType());
        }

        GitHubSyncLog refreshed = gitHubSyncLogRepository.findByIdAndUserId(logId, userId)
            .orElse(logItem);
        return GitHubSyncLogResponse.from(refreshed);
    }

    /**
     * 사용자의 최근 동기화 이력(최대 20건)을 조회합니다.
     */
    @Transactional(readOnly = true)
    public List<GitHubSyncLogResponse> getRecentLogs(Long userId) {
        return gitHubSyncLogRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(GitHubSyncLogResponse::from)
            .toList();
    }
}

package com.example.atlex.domain.github;

import com.example.atlex.domain.github.client.GitHubApiClient;
import com.example.atlex.domain.github.dto.response.GitHubSyncLogResponse;
import com.example.atlex.domain.github.entity.*;
import com.example.atlex.domain.github.exception.GitHubApiException;
import com.example.atlex.domain.github.repository.GitHubSyncConfigRepository;
import com.example.atlex.domain.github.repository.GitHubSyncLogRepository;
import com.example.atlex.domain.github.service.GitHubSyncService;
import com.example.atlex.domain.github.util.AesEncryptionUtils;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb_sync_svc;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "github.encryption-key=test-encryption-key-for-unit-test!"
})
@Transactional
class GitHubSyncServiceTest {

    @Autowired
    GitHubSyncService gitHubSyncService;
    @Autowired
    UserRepository userRepository;
    @Autowired
    PostRepository postRepository;
    @Autowired
    GitHubSyncConfigRepository gitHubSyncConfigRepository;
    @Autowired
    GitHubSyncLogRepository gitHubSyncLogRepository;

    @MockitoBean
    GitHubApiClient gitHubApiClient;

    private User user;
    private Post post;
    private GitHubSyncConfig config;

    @BeforeEach
    void setUp() {
        user = userRepository.save(User.builder()
            .userId("syncuser")
            .email("syncuser@example.com")
            .password("password")
            .name("동기화유저")
            .termsAgreed(true)
            .privacyAgreed(true)
            .build());

        post = postRepository.save(Post.builder()
            .user(user)
            .title("테스트 포스트")
            .content("본문 내용")
            .isPublic(true)
            .build());

        String encryptedToken = AesEncryptionUtils.encrypt("dummy-gh-token", "test-encryption-key-for-unit-test!");

        config = gitHubSyncConfigRepository.save(GitHubSyncConfig.builder()
            .user(user)
            .encryptedAccessToken(encryptedToken)
            .githubUsername("gh-username")
            .githubEmail("grass-email@github.com")
            .repositoryName("gh-username/my-blog")
            .branchName("main")
            .directoryPath("posts/")
            .deleteOption(DeleteOption.DELETE_FILE)
            .isEnabled(true)
            .build());
    }

    @Test
    @DisplayName("글 발행 시 GitHubApiClient를 호출하여 커밋·푸시하고 성공 로그를 남긴다")
    void syncPostSuccess() {
        // given
        given(gitHubApiClient.getFileSha(anyString(), eq("gh-username/my-blog"), anyString(), eq("main")))
            .willReturn(Optional.empty());

        given(gitHubApiClient.createOrUpdateFile(
            eq("dummy-gh-token"),
            eq("gh-username/my-blog"),
            anyString(),
            eq("main"),
            contains("publish"),
            anyString(),
            isNull(),
            eq("gh-username"),
            eq("grass-email@github.com"))).willReturn("commit-sha-12345");

        // when
        gitHubSyncService.syncPost(post.getId(), user.getId(), SyncType.CREATE);

        // then
        List<GitHubSyncLogResponse> logs = gitHubSyncService.getRecentLogs(user.getId());
        assertThat(logs).isNotEmpty();
        assertThat(logs.get(0).getStatus()).isEqualTo(SyncLogStatus.SUCCESS);
        assertThat(logs.get(0).getCommitSha()).isEqualTo("commit-sha-12345");

        GitHubSyncConfig refreshedConfig = gitHubSyncConfigRepository.findByUser_Id(user.getId()).orElseThrow();
        assertThat(refreshedConfig.getSyncStatus()).isEqualTo(SyncStatus.SUCCESS);
    }

    @Test
    @DisplayName("API 호출 실패 시 실패 로그를 기록하고 config 상태를 FAILED로 갱신한다")
    void syncPostFailure() {
        // given
        given(gitHubApiClient.createOrUpdateFile(any(), any(), any(), any(), any(), any(), any(), any(), any()))
            .willThrow(new RuntimeException("GitHub API 503 Service Unavailable"));

        // when
        gitHubSyncService.syncPost(post.getId(), user.getId(), SyncType.CREATE);

        // then
        List<GitHubSyncLogResponse> logs = gitHubSyncService.getRecentLogs(user.getId());
        assertThat(logs).isNotEmpty();
        assertThat(logs.get(0).getStatus()).isEqualTo(SyncLogStatus.FAILED);
        assertThat(logs.get(0).getErrorMessage()).contains("503");

        GitHubSyncConfig refreshedConfig = gitHubSyncConfigRepository.findByUser_Id(user.getId()).orElseThrow();
        assertThat(refreshedConfig.getSyncStatus()).isEqualTo(SyncStatus.FAILED);
    }

    @Test
    @DisplayName("제목이 변경되어 파일명이 달라진 경우 이전 파일을 deleteFile로 정리한다")
    void syncPostDeletesOldFileOnRename() {
        // given: 이전에 다른 파일명으로 성공한 동기화 로그 기록
        String oldPath = "posts/999-old-title.md";
        gitHubSyncLogRepository.save(GitHubSyncLog.builder()
            .userId(user.getId())
            .postId(post.getId())
            .postTitle("이전 제목")
            .syncType(SyncType.CREATE)
            .targetPath(oldPath)
            .status(SyncLogStatus.SUCCESS)
            .commitSha("old-sha-111")
            .build());

        given(gitHubApiClient.getFileSha(anyString(), eq("gh-username/my-blog"), eq(oldPath), eq("main")))
            .willReturn(Optional.of("old-file-blob-sha"));

        given(gitHubApiClient.getFileSha(anyString(), eq("gh-username/my-blog"), argThat(p -> !p.equals(oldPath)),
            eq("main")))
            .willReturn(Optional.empty());

        given(gitHubApiClient.createOrUpdateFile(any(), any(), any(), any(), any(), any(), any(), any(), any()))
            .willReturn("new-commit-sha-222");

        // when: 새 제목으로 글 수정 동기화 실행
        gitHubSyncService.syncPost(post.getId(), user.getId(), SyncType.UPDATE);

        // then: 구버전 파일 삭제가 호출되었는지 검증
        verify(gitHubApiClient).deleteFile(
            eq("dummy-gh-token"),
            eq("gh-username/my-blog"),
            eq(oldPath),
            eq("main"),
            contains("rename/delete"),
            eq("old-file-blob-sha"),
            eq("gh-username"),
            eq("grass-email@github.com"));
    }

    @Test
    @DisplayName("실패한 동기화 로그를 재시도하면 커밋을 수행하고 원본 로그의 retryCount와 status를 갱신하여 반환한다")
    void retrySyncSuccess() {
        // given
        GitHubSyncLog failedLog = gitHubSyncLogRepository.save(GitHubSyncLog.builder()
            .userId(user.getId())
            .postId(post.getId())
            .postTitle(post.getTitle())
            .syncType(SyncType.CREATE)
            .targetPath("posts/fail.md")
            .status(SyncLogStatus.FAILED)
            .errorMessage("이전 실패 사유")
            .build());

        given(gitHubApiClient.getFileSha(anyString(), eq("gh-username/my-blog"), anyString(), eq("main")))
            .willReturn(Optional.empty());

        given(gitHubApiClient.createOrUpdateFile(any(), any(), any(), any(), any(), any(), any(), any(), any()))
            .willReturn("retry-commit-sha-777");

        // when
        GitHubSyncLogResponse response = gitHubSyncService.retrySync(failedLog.getId(), user.getId());

        // then
        assertThat(response.getId()).isEqualTo(failedLog.getId());
        assertThat(response.getStatus()).isEqualTo(SyncLogStatus.SUCCESS);
        assertThat(response.getCommitSha()).isEqualTo("retry-commit-sha-777");
        assertThat(response.getRetryCount()).isEqualTo(1);
        assertThat(response.getErrorMessage()).isNull();

        GitHubSyncLog refreshed = gitHubSyncLogRepository.findById(failedLog.getId()).orElseThrow();
        assertThat(refreshed.getStatus()).isEqualTo(SyncLogStatus.SUCCESS);
        assertThat(refreshed.getCommitSha()).isEqualTo("retry-commit-sha-777");
        assertThat(refreshed.getRetryCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("실패(FAILED) 상태가 아닌 동기화 로그를 재시도하면 예외가 발생한다")
    void retrySyncRejectsNonFailedLog() {
        // given
        GitHubSyncLog successLog = gitHubSyncLogRepository.save(GitHubSyncLog.builder()
            .userId(user.getId())
            .postId(post.getId())
            .postTitle(post.getTitle())
            .syncType(SyncType.CREATE)
            .targetPath("posts/success.md")
            .status(SyncLogStatus.SUCCESS)
            .commitSha("sha-already-done")
            .build());

        // when & then
        org.assertj.core.api.Assertions.assertThatThrownBy(
            () -> gitHubSyncService.retrySync(successLog.getId(), user.getId()))
            .isInstanceOf(GitHubApiException.class)
            .hasMessageContaining("실패한 동기화 로그만 재시도할 수 있습니다");
    }

    @Test
    @DisplayName("GitHub 연동이 비활성화되어 있는 경우 재시도 시 예외가 발생한다")
    void retrySyncFailsWhenDisabled() {
        // given
        config.updateConfig("gh-username/my-blog", "main", "posts/", DeleteOption.DELETE_FILE, false);
        gitHubSyncConfigRepository.save(config);

        GitHubSyncLog failedLog = gitHubSyncLogRepository.save(GitHubSyncLog.builder()
            .userId(user.getId())
            .postId(post.getId())
            .postTitle(post.getTitle())
            .syncType(SyncType.CREATE)
            .targetPath("posts/fail.md")
            .status(SyncLogStatus.FAILED)
            .errorMessage("이전 실패 사유")
            .build());

        // when & then
        org.assertj.core.api.Assertions.assertThatThrownBy(
            () -> gitHubSyncService.retrySync(failedLog.getId(), user.getId()))
            .isInstanceOf(GitHubApiException.class)
            .hasMessageContaining("비활성화");
    }
}

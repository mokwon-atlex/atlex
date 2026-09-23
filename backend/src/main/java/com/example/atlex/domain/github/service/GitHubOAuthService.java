package com.example.atlex.domain.github.service;

import com.example.atlex.domain.github.client.GitHubApiClient;
import com.example.atlex.domain.github.client.GitHubApiClient.GitHubUserProfile;
import com.example.atlex.domain.github.dto.request.GitHubConfigUpdateRequest;
import com.example.atlex.domain.github.dto.response.GitHubConfigResponse;
import com.example.atlex.domain.github.dto.response.GitHubOAuthUrlResponse;
import com.example.atlex.domain.github.dto.response.GitHubRepoResponse;
import com.example.atlex.domain.github.entity.GitHubSyncConfig;
import com.example.atlex.domain.github.exception.GitHubOAuthFailedException;
import com.example.atlex.domain.github.exception.GitHubSyncNotConfiguredException;
import com.example.atlex.domain.github.repository.GitHubSyncConfigRepository;
import com.example.atlex.domain.github.util.AesEncryptionUtils;
import com.example.atlex.domain.github.util.OAuthStateUtils;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.exception.UserNotFoundException;
import com.example.atlex.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * GitHub OAuth 계정 연동 및 설정 관리를 담당하는 서비스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GitHubOAuthService {

    private final GitHubApiClient gitHubApiClient;
    private final GitHubSyncConfigRepository gitHubSyncConfigRepository;
    private final UserRepository userRepository;

    @Value("${github.client-id:}")
    private String clientId;

    @Value("${github.client-secret:}")
    private String clientSecret;

    @Value("${github.redirect-uri:http://localhost:3000/blog_option}")
    private String redirectUri;

    @Value("${github.encryption-key:atlex-default-github-encrypt-key-32b!}")
    private String encryptionKey;

    /**
     * 사용자를 GitHub OAuth 로그인 창으로 안내하기 위한 인가 URL을 생성합니다. (CSRF 방지 state 토큰 포함)
     */
    public GitHubOAuthUrlResponse getOAuthLoginUrl(Long userId) {
        if (clientId == null || clientId.isBlank()) {
            throw new GitHubOAuthFailedException("GitHub Client ID가 설정되지 않았습니다. 환경 변수를 확인해주세요.");
        }

        String encodedRedirect = URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);
        String state = OAuthStateUtils.generateState(userId, encryptionKey);

        String url = String.format(
            "https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&scope=repo,user:email&state=%s",
            clientId,
            encodedRedirect,
            state);
        return new GitHubOAuthUrlResponse(url);
    }

    /**
     * OAuth 인가 코드와 state를 받아 토큰을 발급받고 사용자의 GitHub 정보를 안전하게 암호화하여 저장합니다.
     */
    @Transactional
    public GitHubConfigResponse handleCallback(Long userId, String code, String state) {
        User user = userRepository.findById(userId)
            .orElseThrow(UserNotFoundException::new);

        if (state != null && !state.isBlank()) {
            OAuthStateUtils.validateState(state, userId, encryptionKey);
        }

        String rawAccessToken = gitHubApiClient.exchangeAccessToken(clientId, clientSecret, code, redirectUri);
        GitHubUserProfile profile = gitHubApiClient.getUserProfile(rawAccessToken);

        // 잔디 반영용 primary verified 이메일 획득
        String commitEmail = gitHubApiClient.getPrimaryVerifiedEmail(rawAccessToken)
            .orElse(profile.getEmail() != null ? profile.getEmail() : user.getEmail());

        String encryptedToken = AesEncryptionUtils.encrypt(rawAccessToken, encryptionKey);

        GitHubSyncConfig config = gitHubSyncConfigRepository.findByUser_Id(userId)
            .orElseGet(() -> GitHubSyncConfig.builder()
                .user(user)
                .encryptedAccessToken(encryptedToken)
                .githubUsername(profile.getLogin())
                .githubEmail(commitEmail)
                .githubAvatarUrl(profile.getAvatarUrl())
                .build());

        config.updateTokenAndProfile(encryptedToken, profile.getLogin(), commitEmail, profile.getAvatarUrl());
        GitHubSyncConfig saved = gitHubSyncConfigRepository.save(config);

        log.info("GitHub 계정 연동 완료: user={}, githubUser={}", user.getUserId(), profile.getLogin());
        return GitHubConfigResponse.from(saved);
    }

    /**
     * 현재 사용자의 GitHub 연동 상태 및 설정을 조회합니다.
     */
    @Transactional(readOnly = true)
    public GitHubConfigResponse getConfig(Long userId) {
        return gitHubSyncConfigRepository.findByUser_Id(userId)
            .map(GitHubConfigResponse::from)
            .orElseGet(GitHubConfigResponse::disconnected);
    }

    /**
     * 동기화 대상 저장소 및 세부 설정을 업데이트합니다.
     */
    @Transactional
    public GitHubConfigResponse updateConfig(Long userId, GitHubConfigUpdateRequest request) {
        GitHubSyncConfig config = gitHubSyncConfigRepository.findByUser_Id(userId)
            .orElseThrow(() -> new GitHubSyncNotConfiguredException("먼저 GitHub 계정을 연동해 주세요."));

        config.updateConfig(
            request.getRepositoryName(),
            request.getBranchName(),
            request.getDirectoryPath(),
            request.getDeleteOption(),
            request.getIsEnabled());

        return GitHubConfigResponse.from(config);
    }

    /**
     * GitHub 연동을 해제하고 저장된 토큰 정보를 완전히 파기합니다. 원격 인가도 함께 폐기(Revoke)합니다.
     */
    @Transactional
    public void disconnect(Long userId) {
        gitHubSyncConfigRepository.findByUser_Id(userId).ifPresent(config -> {
            try {
                String rawToken = AesEncryptionUtils.decrypt(config.getEncryptedAccessToken(), encryptionKey);
                gitHubApiClient.revokeAppGrant(clientId, clientSecret, rawToken);
            } catch (Exception e) {
                log.warn("GitHub 원격 토큰 폐기 중 예외 (로컬 토큰 삭제는 계속 진행): {}", e.getMessage());
            }
            gitHubSyncConfigRepository.deleteByUser_Id(userId);
            log.info("GitHub 연동 해제 및 토큰 파기 완료: userId={}", userId);
        });
    }

    /**
     * 사용자의 GitHub 저장소 목록을 조회합니다.
     */
    @Transactional(readOnly = true)
    public List<GitHubRepoResponse> getRepositories(Long userId) {
        GitHubSyncConfig config = gitHubSyncConfigRepository.findByUser_Id(userId)
            .orElseThrow(() -> new GitHubSyncNotConfiguredException("먼저 GitHub 계정을 연동해 주세요."));

        String rawToken = AesEncryptionUtils.decrypt(config.getEncryptedAccessToken(), encryptionKey);
        return gitHubApiClient.getUserRepositories(rawToken);
    }
}

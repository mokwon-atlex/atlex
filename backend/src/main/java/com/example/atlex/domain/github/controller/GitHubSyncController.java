package com.example.atlex.domain.github.controller;

import com.example.atlex.domain.github.dto.request.GitHubCallbackRequest;
import com.example.atlex.domain.github.dto.request.GitHubConfigUpdateRequest;
import com.example.atlex.domain.github.dto.response.GitHubConfigResponse;
import com.example.atlex.domain.github.dto.response.GitHubOAuthUrlResponse;
import com.example.atlex.domain.github.dto.response.GitHubRepoResponse;
import com.example.atlex.domain.github.dto.response.GitHubSyncLogResponse;
import com.example.atlex.domain.github.service.GitHubOAuthService;
import com.example.atlex.domain.github.service.GitHubSyncService;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * GitHub 계정 연동 및 저장소 백업 설정을 처리하는 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/v1/github")
@RequiredArgsConstructor
public class GitHubSyncController implements GitHubSyncControllerDocs {

    private final GitHubOAuthService gitHubOAuthService;
    private final GitHubSyncService gitHubSyncService;

    @Override
    @GetMapping("/oauth/url")
    public ResponseEntity<ApiResponse<GitHubOAuthUrlResponse>> getOAuthUrl(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails) {
        GitHubOAuthUrlResponse response = gitHubOAuthService.getOAuthLoginUrl(principalDetails.user().getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Override
    @PostMapping("/oauth/callback")
    public ResponseEntity<ApiResponse<GitHubConfigResponse>> connectGitHub(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Valid @RequestBody
        GitHubCallbackRequest request) {
        GitHubConfigResponse response = gitHubOAuthService.handleCallback(
            principalDetails.user().getId(),
            request.getCode(),
            request.getState());
        return ResponseEntity.ok(ApiResponse.success(response, "GitHub 계정이 성공적으로 연동되었습니다."));
    }

    @Override
    @GetMapping("/config")
    public ResponseEntity<ApiResponse<GitHubConfigResponse>> getConfig(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails) {
        GitHubConfigResponse response = gitHubOAuthService.getConfig(principalDetails.user().getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Override
    @PatchMapping("/config")
    public ResponseEntity<ApiResponse<GitHubConfigResponse>> updateConfig(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Valid @RequestBody
        GitHubConfigUpdateRequest request) {
        GitHubConfigResponse response = gitHubOAuthService.updateConfig(
            principalDetails.user().getId(),
            request);
        return ResponseEntity.ok(ApiResponse.success(response, "GitHub 동기화 설정이 저장되었습니다."));
    }

    @Override
    @DeleteMapping("/config")
    public ResponseEntity<ApiResponse<Void>> disconnect(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails) {
        gitHubOAuthService.disconnect(principalDetails.user().getId());
        return ResponseEntity.ok(ApiResponse.success(null, "GitHub 연동이 안전하게 해제되었습니다."));
    }

    @Override
    @GetMapping("/repositories")
    public ResponseEntity<ApiResponse<List<GitHubRepoResponse>>> getRepositories(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails) {
        List<GitHubRepoResponse> repos = gitHubOAuthService.getRepositories(principalDetails.user().getId());
        return ResponseEntity.ok(ApiResponse.success(repos));
    }

    @Override
    @GetMapping("/sync/logs")
    public ResponseEntity<ApiResponse<List<GitHubSyncLogResponse>>> getSyncLogs(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails) {
        List<GitHubSyncLogResponse> logs = gitHubSyncService.getRecentLogs(principalDetails.user().getId());
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @Override
    @PostMapping("/sync/retry/{logId}")
    public ResponseEntity<ApiResponse<GitHubSyncLogResponse>> retrySync(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @PathVariable
        Long logId) {
        GitHubSyncLogResponse response = gitHubSyncService.retrySync(logId, principalDetails.user().getId());
        return ResponseEntity.ok(ApiResponse.success(response, "동기화 재시도가 완료되었습니다."));
    }
}

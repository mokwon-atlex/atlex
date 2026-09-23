package com.example.atlex.domain.github.controller;

import com.example.atlex.domain.github.dto.request.GitHubCallbackRequest;
import com.example.atlex.domain.github.dto.request.GitHubConfigUpdateRequest;
import com.example.atlex.domain.github.dto.response.GitHubConfigResponse;
import com.example.atlex.domain.github.dto.response.GitHubOAuthUrlResponse;
import com.example.atlex.domain.github.dto.response.GitHubRepoResponse;
import com.example.atlex.domain.github.dto.response.GitHubSyncLogResponse;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * GitHub 연동 및 동기화 API에 대한 Swagger 명세 인터페이스입니다.
 */
@Tag(name = "GitHub Sync", description = "GitHub 계정 연동 및 마크다운 자동 커밋 백업 API")
public interface GitHubSyncControllerDocs {

    @Operation(summary = "GitHub OAuth 로그인 URL 발급", description = "GitHub 계정 연동을 위한 OAuth 인가 URL을 조회합니다.")
    ResponseEntity<ApiResponse<GitHubOAuthUrlResponse>> getOAuthUrl();

    @Operation(summary = "GitHub OAuth 연동 완료 (콜백)", description = "GitHub OAuth 인가 코드로 액세스 토큰을 발급받아 암호화 저장합니다.")
    ResponseEntity<ApiResponse<GitHubConfigResponse>> connectGitHub(
        PrincipalDetails principalDetails,
        GitHubCallbackRequest request);

    @Operation(summary = "GitHub 연동 상태 및 설정 조회", description = "현재 로그인한 사용자의 GitHub 연동 상태 및 동기화 설정을 조회합니다.")
    ResponseEntity<ApiResponse<GitHubConfigResponse>> getConfig(PrincipalDetails principalDetails);

    @Operation(summary = "GitHub 동기화 설정 수정", description = "동기화 대상 저장소, 브랜치, 디렉터리 경로, 삭제 옵션 등을 수정합니다.")
    ResponseEntity<ApiResponse<GitHubConfigResponse>> updateConfig(
        PrincipalDetails principalDetails,
        GitHubConfigUpdateRequest request);

    @Operation(summary = "GitHub 연동 해제", description = "GitHub 연동을 해제하고 저장된 토큰 정보를 완전히 파기합니다.")
    ResponseEntity<ApiResponse<Void>> disconnect(PrincipalDetails principalDetails);

    @Operation(summary = "접근 가능한 GitHub 저장소 목록 조회", description = "연동된 GitHub 계정에서 접근 가능한 저장소 목록을 조회합니다.")
    ResponseEntity<ApiResponse<List<GitHubRepoResponse>>> getRepositories(PrincipalDetails principalDetails);

    @Operation(summary = "최근 동기화 로그 조회", description = "최근 20건의 GitHub 자동 커밋 동기화 이력을 조회합니다.")
    ResponseEntity<ApiResponse<List<GitHubSyncLogResponse>>> getSyncLogs(PrincipalDetails principalDetails);

    @Operation(summary = "실패한 동기화 재시도", description = "실패 상태인 특정 동기화 작업을 다시 실행합니다.")
    ResponseEntity<ApiResponse<GitHubSyncLogResponse>> retrySync(
        PrincipalDetails principalDetails,
        Long logId);
}

package com.example.atlex.domain.github.dto.response;

import com.example.atlex.domain.github.entity.DeleteOption;
import com.example.atlex.domain.github.entity.GitHubSyncConfig;
import com.example.atlex.domain.github.entity.SyncStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 사용자의 GitHub 연동 상태 및 설정 응답 DTO입니다.
 */
@Schema(description = "GitHub 연동 상태 및 동기화 설정 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GitHubConfigResponse {

    @Schema(description = "GitHub 연동 여부", example = "true")
    private Boolean isConnected;

    @Schema(description = "연동된 GitHub 계정명", example = "octocat")
    private String githubUsername;

    @Schema(description = "잔디 반영용 이메일", example = "octocat@github.com")
    private String githubEmail;

    @Schema(description = "GitHub 프로필 아바타 URL", example = "https://avatars.githubusercontent.com/u/583231")
    private String githubAvatarUrl;

    @Schema(description = "백업 대상 저장소 (owner/repo)", example = "octocat/my-blog-posts")
    private String repositoryName;

    @Schema(description = "백업 브랜치명", example = "main")
    private String branchName;

    @Schema(description = "저장 디렉터리 경로", example = "posts/")
    private String directoryPath;

    @Schema(description = "글 삭제 시 처리 옵션", example = "DELETE_FILE")
    private DeleteOption deleteOption;

    @Schema(description = "동기화 활성화 여부", example = "true")
    private Boolean isEnabled;

    @Schema(description = "전반적인 동기화 상태 (IDLE, SYNCING, SUCCESS, FAILED)", example = "SUCCESS")
    private SyncStatus syncStatus;

    @Schema(description = "최근 동기화 일시")
    private LocalDateTime lastSyncAt;

    @Schema(description = "최근 동기화 실패 사유 (정상일 경우 null)")
    private String lastErrorMessage;

    /**
     * 연동되지 않은 상태의 기본 응답을 생성합니다.
     */
    public static GitHubConfigResponse disconnected() {
        return GitHubConfigResponse.builder()
            .isConnected(false)
            .isEnabled(false)
            .syncStatus(SyncStatus.IDLE)
            .build();
    }

    /**
     * GitHubSyncConfig 엔티티로부터 응답 DTO를 생성합니다.
     */
    public static GitHubConfigResponse from(GitHubSyncConfig config) {
        if (config == null) {
            return disconnected();
        }
        return GitHubConfigResponse.builder()
            .isConnected(true)
            .githubUsername(config.getGithubUsername())
            .githubEmail(config.getGithubEmail())
            .githubAvatarUrl(config.getGithubAvatarUrl())
            .repositoryName(config.getRepositoryName())
            .branchName(config.getBranchName())
            .directoryPath(config.getDirectoryPath())
            .deleteOption(config.getDeleteOption())
            .isEnabled(config.getIsEnabled())
            .syncStatus(config.getSyncStatus())
            .lastSyncAt(config.getLastSyncAt())
            .lastErrorMessage(config.getLastErrorMessage())
            .build();
    }
}

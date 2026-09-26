package com.example.atlex.domain.github.dto.response;

import com.example.atlex.domain.github.entity.GitHubSyncLog;
import com.example.atlex.domain.github.entity.SyncLogStatus;
import com.example.atlex.domain.github.entity.SyncType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 개별 GitHub 동기화 로그 응답 DTO입니다.
 */
@Schema(description = "GitHub 동기화 로그 항목")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GitHubSyncLogResponse {

    @Schema(description = "로그 ID", example = "1")
    private Long id;

    @Schema(description = "동기화된 게시글 ID", example = "42")
    private Long postId;

    @Schema(description = "동기화된 게시글 제목", example = "Spring Boot 4 마이그레이션 가이드")
    private String postTitle;

    @Schema(description = "동기화 작업 유형 (CREATE, UPDATE, DELETE)", example = "CREATE")
    private SyncType syncType;

    @Schema(description = "저장소 내 파일 경로", example = "posts/42-spring-boot-4.md")
    private String targetPath;

    @Schema(description = "동기화 성공 여부 (SUCCESS, FAILED)", example = "SUCCESS")
    private SyncLogStatus status;

    @Schema(description = "재시도 횟수", example = "0")
    private int retryCount;

    @Schema(description = "실패 사유 (정상일 경우 null)")
    private String errorMessage;

    @Schema(description = "생성된 커밋 해시 (실패 시 null)", example = "7d89b84398...")
    private String commitSha;

    @Schema(description = "동기화 실행 일시")
    private LocalDateTime createdAt;

    /**
     * GitHubSyncLog 엔티티로부터 DTO를 변환합니다.
     */
    public static GitHubSyncLogResponse from(GitHubSyncLog log) {
        return GitHubSyncLogResponse.builder()
            .id(log.getId())
            .postId(log.getPostId())
            .postTitle(log.getPostTitle())
            .syncType(log.getSyncType())
            .targetPath(log.getTargetPath())
            .status(log.getStatus())
            .retryCount(log.getRetryCount())
            .errorMessage(log.getErrorMessage())
            .commitSha(log.getCommitSha())
            .createdAt(log.getCreatedAt())
            .build();
    }
}

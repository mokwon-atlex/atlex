package com.example.atlex.domain.github.dto.request;

import com.example.atlex.domain.github.entity.DeleteOption;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * GitHub 백업 저장소 및 동기화 설정 변경 요청 DTO입니다.
 */
@Schema(description = "GitHub 동기화 설정 변경 요청")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GitHubConfigUpdateRequest {

    @Schema(description = "백업 대상 GitHub 저장소 (owner/repo)", example = "octocat/my-blog-posts")
    private String repositoryName;

    @Schema(description = "백업 브랜치명", example = "main")
    private String branchName;

    @Schema(description = "저장소 내 디렉터리 경로", example = "posts/")
    private String directoryPath;

    @Schema(description = "글 삭제 시 GitHub 처리 옵션 (DELETE_FILE / KEEP_FILE)", example = "DELETE_FILE")
    private DeleteOption deleteOption;

    @Schema(description = "동기화 활성화 여부", example = "true")
    private Boolean isEnabled;
}

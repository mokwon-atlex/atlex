package com.example.atlex.domain.github.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자의 GitHub 저장소 목록 항목 DTO입니다.
 */
@Schema(description = "GitHub 저장소 정보")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GitHubRepoResponse {

    @Schema(description = "저장소 이름", example = "my-blog-posts")
    private String name;

    @Schema(description = "저장소 전체 이름 (owner/repo)", example = "octocat/my-blog-posts")
    private String fullName;

    @Schema(description = "저장소 설명", example = "Personal tech blog markdown backup")
    private String description;

    @Schema(description = "비공개 저장소 여부", example = "false")
    private Boolean isPrivate;

    @Schema(description = "기본 브랜치명", example = "main")
    private String defaultBranch;
}

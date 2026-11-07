package com.example.atlex.domain.github.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 게시글 마크다운(.md) 파일 내보내기 데이터 DTO입니다.
 */
@Schema(description = "게시글 마크다운 내보내기 데이터")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostMarkdownExportResponse {

    @Schema(description = "권장 파일명", example = "42-spring-boot-guide.md")
    private String filename;

    @Schema(description = "YAML Frontmatter를 포함한 전체 마크다운 본문")
    private String content;
}

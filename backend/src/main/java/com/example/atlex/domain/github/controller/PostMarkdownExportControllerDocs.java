package com.example.atlex.domain.github.controller;

import com.example.atlex.domain.github.dto.response.PostMarkdownExportResponse;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

/**
 * 게시글 마크다운 내보내기/다운로드 API에 대한 Swagger 명세 인터페이스입니다.
 */
@Tag(name = "Post Export", description = "게시글 마크다운(.md) 파일 내보내기 및 다운로드 API")
public interface PostMarkdownExportControllerDocs {

    @Operation(summary = "게시글 마크다운 데이터 조회", description = "YAML Frontmatter가 포함된 게시글 마크다운 본문과 권장 파일명을 JSON으로 반환합니다.")
    ResponseEntity<ApiResponse<PostMarkdownExportResponse>> getPostMarkdown(
        Long postId,
        PrincipalDetails principalDetails);

    @Operation(summary = "게시글 마크다운(.md) 파일 다운로드", description = "게시글을 .md 파일 첨부형태로 직접 다운로드합니다.")
    ResponseEntity<byte[]> downloadPostMarkdown(
        Long postId,
        PrincipalDetails principalDetails);
}

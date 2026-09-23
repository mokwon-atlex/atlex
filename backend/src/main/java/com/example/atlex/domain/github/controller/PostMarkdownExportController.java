package com.example.atlex.domain.github.controller;

import com.example.atlex.domain.github.dto.response.PostMarkdownExportResponse;
import com.example.atlex.domain.github.service.GitHubExportService;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

/**
 * 게시글을 마크다운(.md) 파일로 내보내거나 다운로드할 수 있도록 지원하는 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostMarkdownExportController implements PostMarkdownExportControllerDocs {

    private final GitHubExportService gitHubExportService;

    @Override
    @GetMapping("/{postId}/export/markdown")
    public ResponseEntity<ApiResponse<PostMarkdownExportResponse>> getPostMarkdown(
        @PathVariable
        Long postId,
        @AuthenticationPrincipal
        PrincipalDetails principalDetails) {
        Long currentUserId = principalDetails != null ? principalDetails.user().getId() : null;
        PostMarkdownExportResponse response = gitHubExportService.exportPostMarkdown(postId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Override
    @GetMapping("/{postId}/download/markdown")
    public ResponseEntity<byte[]> downloadPostMarkdown(
        @PathVariable
        Long postId,
        @AuthenticationPrincipal
        PrincipalDetails principalDetails) {
        Long currentUserId = principalDetails != null ? principalDetails.user().getId() : null;
        PostMarkdownExportResponse response = gitHubExportService.exportPostMarkdown(postId, currentUserId);

        byte[] bytes = response.getContent().getBytes(StandardCharsets.UTF_8);

        ContentDisposition contentDisposition = ContentDisposition.attachment()
            .filename(response.getFilename(), StandardCharsets.UTF_8)
            .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(contentDisposition);
        headers.setContentType(new MediaType("text", "markdown", StandardCharsets.UTF_8));
        headers.setContentLength(bytes.length);

        return ResponseEntity.ok()
            .headers(headers)
            .body(bytes);
    }
}

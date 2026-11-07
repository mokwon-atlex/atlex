package com.example.atlex.domain.report.controller;

import com.example.atlex.domain.report.dto.request.ReportCreateRequest;
import com.example.atlex.domain.report.dto.response.ReportResponse;
import com.example.atlex.domain.report.service.ReportService;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 사용자의 게시물·댓글 신고 접수 API.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReportController implements ReportControllerDocs {

    private final ReportService reportService;

    /**
     * 게시물을 신고한다.
     */
    @PostMapping("/posts/{postId}/reports")
    public ResponseEntity<ApiResponse<ReportResponse>> reportPost(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @PathVariable
        Long postId,
        @Valid @RequestBody
        ReportCreateRequest request) {
        ReportResponse response = reportService.reportPost(postId, request, principalDetails.user().getId());
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(response, "신고가 접수되었습니다"));
    }

    /**
     * 댓글을 신고한다.
     */
    @PostMapping("/comments/{commentId}/reports")
    public ResponseEntity<ApiResponse<ReportResponse>> reportComment(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @PathVariable
        Long commentId,
        @Valid @RequestBody
        ReportCreateRequest request) {
        ReportResponse response = reportService.reportComment(commentId, request, principalDetails.user().getId());
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(response, "신고가 접수되었습니다"));
    }
}

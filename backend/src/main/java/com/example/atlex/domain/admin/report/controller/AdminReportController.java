package com.example.atlex.domain.admin.report.controller;

import com.example.atlex.domain.report.dto.request.ReportProcessRequest;
import com.example.atlex.domain.report.dto.response.AdminReportDetailResponse;
import com.example.atlex.domain.report.dto.response.AdminReportResponse;
import com.example.atlex.domain.report.entity.ReportStatus;
import com.example.atlex.domain.report.entity.ReportTargetType;
import com.example.atlex.domain.report.service.AdminReportService;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 관리자 신고 조회·처리 API. `/api/v1/admin/**` 경로라 SecurityConfig에서 ADMIN 권한을 요구한다.
 */
@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
public class AdminReportController implements AdminReportControllerDocs {

    private final AdminReportService adminReportService;

    /**
     * 신고 목록을 최신순으로 조회한다.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminReportResponse>>> getReports(
        @RequestParam(required = false)
        ReportStatus status,
        @RequestParam(required = false)
        ReportTargetType targetType,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
        Pageable pageable) {
        Page<AdminReportResponse> response = adminReportService.getReports(status, targetType, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 신고 상세를 조회한다.
     */
    @GetMapping("/{reportId}")
    public ResponseEntity<ApiResponse<AdminReportDetailResponse>> getReport(
        @PathVariable
        Long reportId) {
        return ResponseEntity.ok(ApiResponse.success(adminReportService.getReport(reportId)));
    }

    /**
     * 신고 처리 결과를 기록한다.
     */
    @PatchMapping("/{reportId}")
    public ResponseEntity<ApiResponse<AdminReportResponse>> processReport(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @PathVariable
        Long reportId,
        @Valid @RequestBody
        ReportProcessRequest request) {
        AdminReportResponse response = adminReportService.processReport(reportId, request,
            principalDetails.user().getId());
        return ResponseEntity.ok(ApiResponse.success(response, "신고가 처리되었습니다"));
    }
}

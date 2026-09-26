package com.example.atlex.domain.admin.report.controller;

import com.example.atlex.domain.report.dto.request.ReportProcessRequest;
import com.example.atlex.domain.report.dto.response.AdminReportDetailResponse;
import com.example.atlex.domain.report.dto.response.AdminReportResponse;
import com.example.atlex.domain.report.entity.ReportStatus;
import com.example.atlex.domain.report.entity.ReportTargetType;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * 관리자 신고 API의 Swagger 명세.
 */
@Tag(name = "Admin Report", description = "관리자 신고 관리 API")
public interface AdminReportControllerDocs {

    @Operation(summary = "신고 목록 조회", description = """
        신고 목록을 조회합니다. ADMIN 권한 필수.
        - 기본 정렬: createdAt DESC, 기본 페이지 크기: 20
        - status, targetType을 생략하면 전체를 조회합니다.
        """)
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "관리자 권한 없음")
    })
    ResponseEntity<ApiResponse<Page<AdminReportResponse>>> getReports(
        @Parameter(description = "처리 상태 필터 (PENDING, RESOLVED, REJECTED)") @RequestParam(required = false)
        ReportStatus status,
        @Parameter(description = "신고 대상 종류 필터 (POST, COMMENT)") @RequestParam(required = false)
        ReportTargetType targetType,
        @Parameter(hidden = true)
        Pageable pageable);

    @Operation(summary = "신고 상세 조회", description = "신고 정보와 신고 대상 콘텐츠 요약을 조회합니다. ADMIN 권한 필수. 삭제된 대상도 요약을 제공합니다.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": null,
              "data": {
                "report": {
                  "id": 1, "targetType": "COMMENT", "targetId": 3, "reason": "SPAM",
                  "description": "같은 광고 댓글을 반복해서 작성합니다.", "status": "PENDING",
                  "reporterUserId": "john123", "reporterName": "홍길동",
                  "processedByUserId": null, "resultMemo": null, "processedAt": null,
                  "createdAt": "2024-01-15T10:30:00"
                },
                "target": {
                  "postId": 10, "postAuthorUserId": "blogger", "authorUserId": "writer1", "authorName": "작성자",
                  "preview": "무료 쿠폰 받아가세요", "deleted": false
                }
              },
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "관리자 권한 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "신고 없음 (REPORT_NOT_FOUND)")
    })
    ResponseEntity<ApiResponse<AdminReportDetailResponse>> getReport(
        @Parameter(description = "신고 ID", example = "1") @PathVariable
        Long reportId);

    @Operation(summary = "신고 처리", description = """
        신고 처리 결과를 기록합니다. ADMIN 권한 필수.
        - status는 RESOLVED(조치 완료) 또는 REJECTED(기각)만 허용합니다.
        - 처리 결과는 한 번만 기록할 수 있습니다.
        - 콘텐츠 숨김 등 실제 조치는 이 API에서 수행하지 않습니다.
        """)
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "처리 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "입력값 오류 또는 PENDING 지정(INVALID_REPORT_STATUS)"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "관리자 권한 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "신고 없음 (REPORT_NOT_FOUND)"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "이미 처리된 신고 (REPORT_ALREADY_PROCESSED)", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "REPORT_ALREADY_PROCESSED",
              "message": "이미 처리된 신고입니다.",
              "data": null,
              "errors": null
            }""")))
    })
    ResponseEntity<ApiResponse<AdminReportResponse>> processReport(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Parameter(description = "신고 ID", example = "1") @PathVariable
        Long reportId,
        @Valid @RequestBody
        ReportProcessRequest request);
}

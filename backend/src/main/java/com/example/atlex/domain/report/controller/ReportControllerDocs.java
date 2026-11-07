package com.example.atlex.domain.report.controller;

import com.example.atlex.domain.report.dto.request.ReportCreateRequest;
import com.example.atlex.domain.report.dto.response.ReportResponse;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * 신고 접수 API의 Swagger 명세.
 */
@Tag(name = "Report", description = "게시물·댓글 신고 API")
public interface ReportControllerDocs {

    @Operation(summary = "게시물 신고", description = """
        게시물을 신고합니다. Authorization 헤더 필수.
        - 사유: SPAM, ABUSE, OBSCENE, PRIVACY, COPYRIGHT, OTHER (OTHER는 추가 설명 필수)
        - 동일 사용자는 같은 게시물을 한 번만 신고할 수 있습니다.
        - 본인 게시물은 신고할 수 없습니다.
        """)
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "신고 접수", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": "신고가 접수되었습니다",
              "data": {
                "id": 1, "targetType": "POST", "targetId": 10, "reason": "SPAM",
                "status": "PENDING", "createdAt": "2024-01-15T10:30:00"
              },
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "입력값 오류, 기타 사유 설명 누락(REPORT_DESCRIPTION_REQUIRED) 또는 본인 게시물 신고(SELF_REPORT_NOT_ALLOWED)", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SELF_REPORT_NOT_ALLOWED",
              "message": "본인이 작성한 콘텐츠는 신고할 수 없습니다.",
              "data": null,
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "게시글 없음 (또는 비공개 게시글에 비작성자가 접근)"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "이미 신고한 게시물", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "DUPLICATE_REPORT",
              "message": "이미 신고한 대상입니다.",
              "data": null,
              "errors": null
            }""")))
    })
    ResponseEntity<ApiResponse<ReportResponse>> reportPost(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Parameter(description = "신고할 게시글 ID", example = "10") @PathVariable
        Long postId,
        @Valid @RequestBody
        ReportCreateRequest request);

    @Operation(summary = "댓글 신고", description = """
        댓글을 신고합니다. Authorization 헤더 필수.
        - 사유: SPAM, ABUSE, OBSCENE, PRIVACY, COPYRIGHT, OTHER (OTHER는 추가 설명 필수)
        - 동일 사용자는 같은 댓글을 한 번만 신고할 수 있습니다.
        - 본인 댓글은 신고할 수 없습니다.
        """)
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "신고 접수", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": "신고가 접수되었습니다",
              "data": {
                "id": 2, "targetType": "COMMENT", "targetId": 3, "reason": "ABUSE",
                "status": "PENDING", "createdAt": "2024-01-15T10:30:00"
              },
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "입력값 오류, 기타 사유 설명 누락 또는 본인 댓글 신고"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "댓글 없음 (또는 접근할 수 없는 게시글의 댓글)"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "이미 신고한 댓글")
    })
    ResponseEntity<ApiResponse<ReportResponse>> reportComment(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Parameter(description = "신고할 댓글 ID", example = "3") @PathVariable
        Long commentId,
        @Valid @RequestBody
        ReportCreateRequest request);
}

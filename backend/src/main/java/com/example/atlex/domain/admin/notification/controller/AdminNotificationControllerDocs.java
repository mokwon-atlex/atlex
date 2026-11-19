package com.example.atlex.domain.admin.notification.controller;

import com.example.atlex.domain.notification.dto.request.NoticeNotificationRequest;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Admin Notification", description = "관리자 공지 알림 API")
public interface AdminNotificationControllerDocs {

    @Operation(summary = "서비스 공지 알림 발송", description = "공지 수신이 활성화된 전체 사용자에게 서비스 공지 알림을 발송합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "발송 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "관리자 권한 필요")
    })
    ResponseEntity<ApiResponse<Integer>> sendServiceNotice(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @RequestBody(required = false)
        NoticeNotificationRequest request);
}

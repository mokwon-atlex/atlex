package com.example.atlex.domain.admin.notification.controller;

import com.example.atlex.domain.notification.dto.request.NoticeNotificationRequest;
import com.example.atlex.domain.notification.service.NotificationService;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 관리자 서비스 공지 알림 발송 API. `/api/v1/admin/**` 경로라 SecurityConfig에서 ADMIN 권한을 요구한다.
 */
@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController implements AdminNotificationControllerDocs {

    private final NotificationService notificationService;

    @PostMapping("/notice")
    public ResponseEntity<ApiResponse<Integer>> sendServiceNotice(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @RequestBody(required = false)
        NoticeNotificationRequest request) {
        Long postId = request != null ? request.getPostId() : null;
        int sentCount = notificationService.notifyServiceNotice(principalDetails.user().getId(), postId);
        return ResponseEntity.ok(ApiResponse.success(sentCount, "서비스 공지 알림을 발송했습니다."));
    }
}

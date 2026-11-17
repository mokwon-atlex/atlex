package com.example.atlex.domain.notification.controller;

import com.example.atlex.domain.notification.dto.request.NotificationSettingUpdateRequest;
import com.example.atlex.domain.notification.dto.response.NotificationResponse;
import com.example.atlex.domain.notification.dto.response.NotificationSettingResponse;
import com.example.atlex.domain.notification.dto.response.UnreadNotificationCountResponse;
import com.example.atlex.domain.notification.service.NotificationService;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController implements NotificationControllerDocs {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @PageableDefault(size = 20)
        Pageable pageable) {
        Long userId = principalDetails.user().getId();
        return ResponseEntity.ok(ApiResponse.success(notificationService.getNotifications(userId, pageable)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<UnreadNotificationCountResponse>> getUnreadCount(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails) {
        Long userId = principalDetails.user().getId();
        long unreadCount = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(new UnreadNotificationCountResponse(unreadCount)));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @PathVariable
        Long notificationId) {
        notificationService.markAsRead(notificationId, principalDetails.user().getId());
        return ResponseEntity.ok(ApiResponse.success(null, "알림을 읽음 처리했습니다."));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails) {
        notificationService.markAllAsRead(principalDetails.user().getId());
        return ResponseEntity.ok(ApiResponse.success(null, "모든 알림을 읽음 처리했습니다."));
    }

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<NotificationSettingResponse>> getNotificationSettings(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails) {
        return ResponseEntity.ok(
            ApiResponse.success(notificationService.getNotificationSettings(principalDetails.user().getId())));
    }

    @PatchMapping("/settings")
    public ResponseEntity<ApiResponse<NotificationSettingResponse>> updateNotificationSettings(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @RequestBody
        NotificationSettingUpdateRequest request) {
        NotificationSettingResponse response = notificationService.updateNotificationSettings(
            principalDetails.user().getId(),
            request);
        return ResponseEntity.ok(ApiResponse.success(response, "알림 설정을 저장했습니다."));
    }
}

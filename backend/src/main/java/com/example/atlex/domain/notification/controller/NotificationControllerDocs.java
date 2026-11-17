package com.example.atlex.domain.notification.controller;

import com.example.atlex.domain.notification.dto.response.NotificationResponse;
import com.example.atlex.domain.notification.dto.response.UnreadNotificationCountResponse;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(name = "Notification", description = "알림 API")
public interface NotificationControllerDocs {

    @Operation(summary = "내 알림 목록 조회", description = "로그인한 사용자의 알림 목록을 최신순으로 조회합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 필요")
    })
    ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Parameter(hidden = true)
        Pageable pageable);

    @Operation(summary = "읽지 않은 알림 개수 조회", description = "로그인한 사용자의 읽지 않은 알림 개수를 조회합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 필요")
    })
    ResponseEntity<ApiResponse<UnreadNotificationCountResponse>> getUnreadCount(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails);

    @Operation(summary = "알림 단건 읽음 처리", description = "특정 알림을 읽음 상태로 변경합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "처리 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "본인 알림이 아님"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "알림 없음")
    })
    ResponseEntity<ApiResponse<Void>> markAsRead(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Parameter(description = "알림 ID", example = "1") @PathVariable
        Long notificationId);

    @Operation(summary = "모든 알림 읽음 처리", description = "로그인한 사용자의 읽지 않은 알림을 모두 읽음 상태로 변경합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "처리 성공")
    })
    ResponseEntity<ApiResponse<Void>> markAllAsRead(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails);

    @Operation(summary = "단건 알림 삭제", description = "특정 알림을 삭제합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "삭제 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "알림 없음")
    })
    ResponseEntity<ApiResponse<Void>> deleteNotification(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Parameter(description = "알림 ID", example = "1") @PathVariable
        Long notificationId);

    @Operation(summary = "모든 알림 삭제", description = "로그인한 사용자의 모든 알림을 삭제합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "삭제 성공")
    })
    ResponseEntity<ApiResponse<Void>> deleteAllNotifications(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails);
}

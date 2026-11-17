package com.example.atlex.domain.notification.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 알림 설정 수정 요청 DTO.
 */
@Schema(description = "알림 설정 수정 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSettingUpdateRequest {

    @Schema(description = "댓글 알림 수신 여부", example = "true")
    private Boolean commentEnabled;

    @Schema(description = "좋아요 알림 수신 여부", example = "false")
    private Boolean likeEnabled;

    @Schema(description = "새 팔로워 알림 수신 여부", example = "true")
    private Boolean followEnabled;

    @Schema(description = "서비스 공지 수신 여부", example = "false")
    private Boolean noticeEnabled;
}

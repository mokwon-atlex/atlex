package com.example.atlex.domain.notification.dto.response;

import com.example.atlex.domain.notification.entity.NotificationSetting;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 알림 설정 응답 DTO.
 */
@Schema(description = "알림 설정 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSettingResponse {

    @Schema(description = "댓글 알림 수신 여부", example = "true")
    private boolean commentEnabled;

    @Schema(description = "좋아요 알림 수신 여부", example = "true")
    private boolean likeEnabled;

    @Schema(description = "새 팔로워 알림 수신 여부", example = "true")
    private boolean followEnabled;

    @Schema(description = "서비스 공지 수신 여부", example = "true")
    private boolean noticeEnabled;

    public static NotificationSettingResponse defaults() {
        return NotificationSettingResponse.builder()
            .commentEnabled(true)
            .likeEnabled(true)
            .followEnabled(true)
            .noticeEnabled(true)
            .build();
    }

    public static NotificationSettingResponse from(NotificationSetting setting) {
        return NotificationSettingResponse.builder()
            .commentEnabled(setting.isCommentEnabled())
            .likeEnabled(setting.isLikeEnabled())
            .followEnabled(setting.isFollowEnabled())
            .noticeEnabled(setting.isNoticeEnabled())
            .build();
    }
}

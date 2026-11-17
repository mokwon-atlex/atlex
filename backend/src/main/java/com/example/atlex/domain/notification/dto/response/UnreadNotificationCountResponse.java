package com.example.atlex.domain.notification.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "읽지 않은 알림 개수 응답")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UnreadNotificationCountResponse {

    @Schema(description = "읽지 않은 알림 개수", example = "3")
    private long unreadCount;
}

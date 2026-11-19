package com.example.atlex.domain.notification.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "서비스 공지 알림 발송 요청")
@Getter
@NoArgsConstructor
public class NoticeNotificationRequest {

    @Schema(description = "연결할 공지 게시글 ID (선택)", example = "10")
    private Long postId;
}

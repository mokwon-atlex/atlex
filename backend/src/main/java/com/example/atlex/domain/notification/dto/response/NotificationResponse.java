package com.example.atlex.domain.notification.dto.response;

import com.example.atlex.domain.comment.entity.Comment;
import com.example.atlex.domain.notification.entity.Notification;
import com.example.atlex.domain.notification.entity.NotificationType;
import com.example.atlex.domain.post.entity.Post;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Schema(description = "알림 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    @Schema(description = "알림 ID", example = "1")
    private Long id;

    @Schema(description = "알림 종류", example = "COMMENT")
    private NotificationType type;

    @Schema(description = "읽음 여부", example = "false")
    @JsonProperty("isRead")
    private boolean isRead;

    @Schema(description = "발생 시각")
    private LocalDateTime createdAt;

    @Schema(description = "행동한 사용자 아이디", example = "john123")
    private String actorUserId;

    @Schema(description = "행동한 사용자 이름", example = "홍길동")
    private String actorName;

    @Schema(description = "대상 게시글 ID", example = "10")
    private Long postId;

    @Schema(description = "대상 게시글 제목", example = "Spring Boot 가이드")
    private String postTitle;

    @Schema(description = "대상 게시글 작성자 아이디", example = "author1")
    private String postAuthorUserId;

    @Schema(description = "대상 게시글 삭제 여부", example = "false")
    private boolean postDeleted;

    @Schema(description = "대상 댓글 ID", example = "25")
    private Long commentId;

    @Schema(description = "댓글 미리보기", example = "좋은 글 감사합니다!")
    private String commentContent;

    @Schema(description = "대상 댓글 삭제 여부", example = "false")
    private boolean commentDeleted;

    public static NotificationResponse from(Notification notification) {
        Post post = notification.getPost();
        Comment comment = notification.getComment();
        boolean postDeleted = post != null && Boolean.TRUE.equals(post.getIsDeleted());
        boolean commentDeleted = comment != null && Boolean.TRUE.equals(comment.getIsDeleted());

        return NotificationResponse.builder()
            .id(notification.getId())
            .type(notification.getType())
            .isRead(Boolean.TRUE.equals(notification.getIsRead()))
            .createdAt(notification.getCreatedAt())
            .actorUserId(notification.getActor().getUserId())
            .actorName(notification.getActor().getName())
            .postId(post != null ? post.getId() : null)
            .postTitle(post == null ? null : (postDeleted ? "삭제된 게시글" : post.getTitle()))
            .postAuthorUserId(post != null && post.getUser() != null ? post.getUser().getUserId() : null)
            .postDeleted(postDeleted)
            .commentId(comment != null ? comment.getId() : null)
            .commentContent(comment == null || commentDeleted ? null : comment.getContent())
            .commentDeleted(commentDeleted)
            .build();
    }
}

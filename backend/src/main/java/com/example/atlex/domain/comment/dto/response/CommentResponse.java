package com.example.atlex.domain.comment.dto.response;

import com.example.atlex.domain.comment.entity.Comment;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Schema(description = "댓글 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {

    @Schema(description = "댓글 ID", example = "1")
    private Long id;
    @Schema(description = "게시글 ID", example = "10")
    private Long postId;
    @Schema(description = "댓글 내용", example = "좋은 글 감사합니다!")
    private String content;
    @Schema(description = "작성자 DB ID", example = "1")
    private Long authorId;
    @Schema(description = "작성자 아이디", example = "john123")
    private String authorUserId;
    @Schema(description = "작성자 닉네임", example = "홍길동")
    private String authorName;
    @Schema(description = "작성일시", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;
    @Schema(description = "수정일시", example = "2024-01-16T09:00:00")
    private LocalDateTime updatedAt;

    public static CommentResponse from(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .content(comment.getContent())
                .authorId(comment.getUser().getId())
                .authorUserId(comment.getUser().getUserId())
                .authorName(comment.getUser().getName())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}

package com.example.atlex.domain.comment.dto.response;

import com.example.atlex.domain.comment.entity.Comment;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 댓글과 답글의 공통 응답.
 * 삭제 상태 댓글은 답글 보존을 위해 자리만 남기며 내용과 작성자 정보를 비운다.
 */
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
    /** 부모 댓글 ID. 최상위 댓글이면 null이다. */
    @Schema(description = "부모 댓글 ID (최상위 댓글이면 null)", example = "null", nullable = true)
    private Long parentId;
    /** 삭제 여부. true이면 내용과 작성자 정보가 null이다. */
    @Schema(description = "삭제 여부 (true이면 content와 작성자 정보가 null)", example = "false")
    private boolean deleted;
    @Schema(description = "댓글 내용 (삭제 시 null)", example = "좋은 글 감사합니다!", nullable = true)
    private String content;
    @Schema(description = "작성자 DB ID (삭제 시 null)", example = "1", nullable = true)
    private Long authorId;
    @Schema(description = "작성자 아이디 (삭제 시 null)", example = "john123", nullable = true)
    private String authorUserId;
    @Schema(description = "작성자 닉네임 (삭제 시 null)", example = "홍길동", nullable = true)
    private String authorName;
    @Schema(description = "작성일시", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;
    @Schema(description = "수정일시 (삭제 시 null)", example = "2024-01-16T09:00:00", nullable = true)
    private LocalDateTime updatedAt;
    /** 목록 조회의 최상위 댓글에만 포함되는 답글 목록. 그 밖의 응답에서는 생략한다. */
    @Schema(description = "답글 목록 (목록 조회의 최상위 댓글에만 포함, 오래된 순)", nullable = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<CommentResponse> replies;

    /**
     * 단건 댓글 응답을 생성한다. 답글 목록은 포함하지 않는다.
     *
     * @param comment 댓글
     * @return 댓글 응답
     */
    public static CommentResponse from(Comment comment) {
        return baseBuilder(comment).build();
    }

    /**
     * 답글 목록을 포함한 최상위 댓글 응답을 생성한다.
     *
     * @param comment 최상위 댓글
     * @param replies 화면에 노출할 답글 응답 목록
     * @return 답글을 포함한 댓글 응답
     */
    public static CommentResponse of(Comment comment, List<CommentResponse> replies) {
        return baseBuilder(comment).replies(replies).build();
    }

    /**
     * 삭제 여부에 따라 내용과 작성자 노출을 결정한 공통 빌더를 만든다.
     */
    private static CommentResponseBuilder baseBuilder(Comment comment) {
        CommentResponseBuilder builder = CommentResponse.builder()
            .id(comment.getId())
            .postId(comment.getPost().getId())
            .parentId(comment.isReply() ? comment.getParent().getId() : null)
            .createdAt(comment.getCreatedAt());

        if (Boolean.TRUE.equals(comment.getIsDeleted())) {
            return builder.deleted(true);
        }
        return builder
            .content(comment.getContent())
            .authorId(comment.getUser().getId())
            .authorUserId(comment.getUser().getUserId())
            .authorName(comment.getUser().getName())
            .updatedAt(comment.getUpdatedAt());
    }
}

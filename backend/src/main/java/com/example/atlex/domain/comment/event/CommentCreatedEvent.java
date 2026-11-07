package com.example.atlex.domain.comment.event;

import com.example.atlex.domain.comment.entity.Comment;

/**
 * 댓글 또는 답글이 작성됐음을 알리는 도메인 이벤트.
 * 트랜잭션 종료 후에도 지연 로딩 없이 사용할 수 있도록 엔티티 대신 식별자만 담는다.
 *
 * @param commentId 작성된 댓글 ID
 * @param postId 댓글이 달린 게시물 ID
 * @param actorId 댓글 작성자 DB ID
 * @param postAuthorId 게시물 작성자 DB ID
 * @param parentAuthorId 답글이면 부모 댓글 작성자 DB ID, 최상위 댓글이면 null
 */
public record CommentCreatedEvent(Long commentId, Long postId, Long actorId, Long postAuthorId,
    Long parentAuthorId) {

    /**
     * 저장된 댓글로 이벤트를 만든다.
     *
     * @param comment 저장된 댓글
     * @return 댓글 작성 이벤트
     */
    public static CommentCreatedEvent from(Comment comment) {
        Long parentAuthorId = comment.isReply() ? comment.getParent().getUser().getId() : null;
        return new CommentCreatedEvent(comment.getId(), comment.getPost().getId(), comment.getUser().getId(),
            comment.getPost().getUser().getId(), parentAuthorId);
    }

    /**
     * 답글 작성 이벤트인지 확인한다.
     *
     * @return 부모 댓글 작성자가 있으면 true
     */
    public boolean isReply() {
        return parentAuthorId != null;
    }
}

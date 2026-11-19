package com.example.atlex.domain.post.event;

/**
 * 게시글 좋아요가 등록됐을 때 알림 생성에 필요한 식별자를 전달하는 도메인 이벤트.
 *
 * @param postId 좋아요가 눌린 게시글 ID
 * @param actorId 좋아요를 누른 사용자 ID
 * @param postAuthorId 게시글 작성자 ID
 */
public record PostLikedEvent(
    Long postId,
    Long actorId,
    Long postAuthorId) {
}

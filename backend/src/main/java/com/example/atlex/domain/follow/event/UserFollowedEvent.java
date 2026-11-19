package com.example.atlex.domain.follow.event;

/**
 * 사용자를 팔로우했을 때 알림 생성에 필요한 식별자를 전달하는 도메인 이벤트.
 *
 * @param followerId 팔로우를 요청한 사용자 ID
 * @param followingId 팔로우 대상 사용자 ID
 */
public record UserFollowedEvent(
    Long followerId,
    Long followingId) {
}

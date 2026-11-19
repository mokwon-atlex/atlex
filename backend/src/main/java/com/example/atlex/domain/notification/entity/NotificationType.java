package com.example.atlex.domain.notification.entity;

/**
 * 서비스 내부 알림의 종류.
 */
public enum NotificationType {
    /** 내 게시물에 달린 최상위 댓글 */
    COMMENT,
    /** 내 댓글에 달린 답글 */
    REPLY,
    /** 내 게시물에 대한 좋아요 */
    LIKE,
    /** 나를 팔로우한 새 팔로워 */
    FOLLOW,
    /** 서비스 공지 알림 */
    NOTICE
}

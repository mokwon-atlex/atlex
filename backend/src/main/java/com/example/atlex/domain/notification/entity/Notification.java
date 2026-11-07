package com.example.atlex.domain.notification.entity;

import com.example.atlex.domain.comment.entity.Comment;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 사용자 활동으로 생성되는 서비스 내부 알림.
 * 행동한 사용자(프로필)와 원본 게시물·댓글을 함께 연결하며, 원본이 소프트 삭제돼도 알림은 유지하고 표시 방식은 조회 시 결정한다.
 * 같은 원본 댓글로 같은 수신자에게 같은 종류의 알림이 중복 생성되지 않도록 unique 제약을 둔다.
 */
@Entity
@Table(name = "notifications", uniqueConstraints = @UniqueConstraint(name = "uk_notifications_recipient_type_comment", columnNames = {
    "recipient_id", "type",
    "comment_id"}), indexes = @Index(name = "idx_notifications_recipient_created", columnList = "recipient_id, created_at"))
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EntityListeners(AuditingEntityListener.class)
public class Notification {

    /** 알림 ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 알림을 받는 사용자 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    /** 알림을 발생시킨 사용자. 프로필 이동 대상이다 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    /** 알림 종류 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    /** 원본 게시물. 게시물과 관계없는 알림이면 null */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    /** 원본 댓글. 댓글과 관계없는 알림이면 null */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private Comment comment;

    /** 수신자의 확인 여부 */
    @Builder.Default
    @Column(nullable = false)
    private Boolean isRead = false;

    /** 알림 생성 시각 */
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

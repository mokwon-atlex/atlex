package com.example.atlex.domain.notification.entity;

import com.example.atlex.domain.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자별 알림 수신 설정을 저장하는 엔티티.
 */
@Entity
@Table(name = "notification_settings", uniqueConstraints = {
    @UniqueConstraint(name = "uk_notification_settings_user", columnNames = "user_id")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "comment_enabled", nullable = false)
    private boolean commentEnabled = true;

    @Column(name = "like_enabled", nullable = false)
    private boolean likeEnabled = true;

    @Column(name = "follow_enabled", nullable = false)
    private boolean followEnabled = true;

    @Column(name = "notice_enabled", nullable = false)
    private boolean noticeEnabled = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    private NotificationSetting(
        User user,
        Boolean commentEnabled,
        Boolean likeEnabled,
        Boolean followEnabled,
        Boolean noticeEnabled) {
        this.user = user;
        this.commentEnabled = commentEnabled == null || commentEnabled;
        this.likeEnabled = likeEnabled == null || likeEnabled;
        this.followEnabled = followEnabled == null || followEnabled;
        this.noticeEnabled = noticeEnabled == null || noticeEnabled;
    }

    public static NotificationSetting defaultFor(User user) {
        return NotificationSetting.builder()
            .user(user)
            .commentEnabled(true)
            .likeEnabled(true)
            .followEnabled(true)
            .noticeEnabled(true)
            .build();
    }

    public void update(Boolean commentEnabled, Boolean likeEnabled, Boolean followEnabled, Boolean noticeEnabled) {
        if (commentEnabled != null) {
            this.commentEnabled = commentEnabled;
        }
        if (likeEnabled != null) {
            this.likeEnabled = likeEnabled;
        }
        if (followEnabled != null) {
            this.followEnabled = followEnabled;
        }
        if (noticeEnabled != null) {
            this.noticeEnabled = noticeEnabled;
        }
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.updatedAt = LocalDateTime.now();
    }
}

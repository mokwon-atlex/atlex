package com.example.atlex.domain.github.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 개별 게시글의 GitHub 커밋·푸시 동기화 이력 및 재시도 로그를 관리하는 엔티티입니다.
 */
@Entity
@Table(name = "github_sync_logs", indexes = {
    @Index(name = "idx_github_sync_logs_user_created", columnList = "user_id, created_at DESC")
})
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EntityListeners(AuditingEntityListener.class)
public class GitHubSyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    private Long postId;

    @Column(length = 255)
    private String postTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SyncType syncType;

    @Column(length = 500)
    private String targetPath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SyncLogStatus status;

    @Builder.Default
    @Column(nullable = false)
    private int retryCount = 0;

    @Column(length = 1000)
    private String errorMessage;

    @Column(length = 100)
    private String commitSha;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * 재시도 성공 시 로그를 갱신합니다.
     */
    public void markSuccess(String commitSha) {
        this.status = SyncLogStatus.SUCCESS;
        this.commitSha = commitSha;
        this.errorMessage = null;
        this.retryCount++;
    }

    /**
     * 재시도 실패 시 에러 사유와 재시도 횟수를 갱신합니다.
     */
    public void markFailure(String errorMessage) {
        this.status = SyncLogStatus.FAILED;
        this.retryCount++;
        this.errorMessage = errorMessage != null && errorMessage.length() > 950
            ? errorMessage.substring(0, 950) + "..."
            : errorMessage;
    }
}

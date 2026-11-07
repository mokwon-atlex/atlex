package com.example.atlex.domain.github.entity;

import com.example.atlex.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 사용자의 GitHub 연동 정보 및 저장소 백업 설정을 관리하는 엔티티입니다.
 */
@Entity
@Table(name = "github_sync_configs")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EntityListeners(AuditingEntityListener.class)
public class GitHubSyncConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /** 암호화된 GitHub OAuth Access Token입니다. */
    @Column(nullable = false, length = 1000)
    private String encryptedAccessToken;

    /** 연동된 GitHub 사용자 계정명입니다. */
    @Column(length = 100)
    private String githubUsername;

    /** GitHub 기여도(잔디) 반영에 사용될 커밋 작성자 이메일입니다. */
    @Column(length = 200)
    private String githubEmail;

    /** GitHub 프로필 아바타 이미지 URL입니다. */
    @Column(length = 500)
    private String githubAvatarUrl;

    /** 백업 대상 GitHub 저장소 이름입니다. (예: username/blog-posts) */
    @Column(length = 200)
    private String repositoryName;

    /** 백업 대상 브랜치 이름입니다. (기본값: main) */
    @Builder.Default
    @Column(nullable = false, length = 100)
    private String branchName = "main";

    /** 저장소 내 마크다운 파일이 저장될 상대 디렉터리 경로입니다. (기본값: posts/) */
    @Builder.Default
    @Column(nullable = false, length = 255)
    private String directoryPath = "posts/";

    /** 게시글 삭제 시 GitHub 파일 처리 옵션입니다. */
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DeleteOption deleteOption = DeleteOption.DELETE_FILE;

    /** 자동 동기화 활성화 여부입니다. */
    @Builder.Default
    @Column(nullable = false)
    private Boolean isEnabled = true;

    /** 전반적인 동기화 상태입니다. */
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SyncStatus syncStatus = SyncStatus.IDLE;

    /** 가장 최근에 동기화가 시도/완료된 일시입니다. */
    private LocalDateTime lastSyncAt;

    /** 가장 최근 발생한 동기화 오류 메시지입니다. */
    @Column(length = 1000)
    private String lastErrorMessage;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    /**
     * 연동 대상 저장소 및 옵션 설정을 변경합니다.
     */
    public void updateConfig(
        String repositoryName,
        String branchName,
        String directoryPath,
        DeleteOption deleteOption,
        Boolean isEnabled) {
        if (repositoryName != null && !repositoryName.isBlank()) {
            String trimmed = repositoryName.trim();
            if (!trimmed.matches("^[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+$")) {
                throw new IllegalArgumentException("저장소 이름은 'owner/repo' 형식이어야 합니다.");
            }
            this.repositoryName = trimmed;
        }
        if (branchName != null && !branchName.isBlank()) {
            String trimmedBranch = branchName.trim();
            if (!trimmedBranch.matches("^(?!/)(?!.*//)(?!.*\\.\\.)[a-zA-Z0-9_./-]+(?<!/)$")) {
                throw new IllegalArgumentException("올바른 브랜치명 형식이 아닙니다.");
            }
            this.branchName = trimmedBranch;
        }
        if (directoryPath != null) {
            String sanitized = directoryPath.trim().replace("\\", "/");
            if (sanitized.contains("..") || sanitized.startsWith("/")) {
                sanitized = sanitized.replaceAll("\\.\\.", "").replaceAll("^/+", "");
            }
            sanitized = sanitized.replaceAll("[^a-zA-Z0-9가-힣._/-]", "");
            if (!sanitized.endsWith("/") && !sanitized.isEmpty()) {
                sanitized += "/";
            }
            if (sanitized.isBlank()) {
                sanitized = "posts/";
            }
            this.directoryPath = sanitized;
        }
        if (deleteOption != null) {
            this.deleteOption = deleteOption;
        }
        if (isEnabled != null) {
            this.isEnabled = isEnabled;
        }
    }

    /**
     * GitHub 재인증 시 토큰 및 프로필 정보를 갱신합니다.
     */
    public void updateTokenAndProfile(
        String encryptedAccessToken,
        String githubUsername,
        String githubEmail,
        String githubAvatarUrl) {
        this.encryptedAccessToken = encryptedAccessToken;
        this.githubUsername = githubUsername;
        this.githubEmail = githubEmail;
        this.githubAvatarUrl = githubAvatarUrl;
    }

    /**
     * 동기화 성공 상태를 기록합니다.
     */
    public void recordSyncSuccess() {
        this.syncStatus = SyncStatus.SUCCESS;
        this.lastSyncAt = LocalDateTime.now();
        this.lastErrorMessage = null;
    }

    /**
     * 동기화 실패 상태를 기록합니다.
     */
    public void recordSyncFailure(String errorMessage) {
        this.syncStatus = SyncStatus.FAILED;
        this.lastSyncAt = LocalDateTime.now();
        this.lastErrorMessage = errorMessage != null && errorMessage.length() > 950
            ? errorMessage.substring(0, 950) + "..."
            : errorMessage;
    }

    /**
     * 동기화 시작 상태로 전환합니다.
     */
    public void startSync() {
        this.syncStatus = SyncStatus.SYNCING;
    }
}

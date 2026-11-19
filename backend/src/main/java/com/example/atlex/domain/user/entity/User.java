package com.example.atlex.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String userId;
    private String email;
    private String password;
    private String name;
    private String profileImage;
    private String info;
    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UserRole role = UserRole.USER;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private MembershipTier membershipTier = MembershipTier.FREE;

    /** 블로그 홈 스킨입니다. 컬럼 추가 전에 가입한 회원은 null이며 기본 스킨으로 취급합니다. */
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private BlogSkin blogSkin = BlogSkin.DEFAULT;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    /** 연속 로그인 실패 횟수입니다. */
    @Builder.Default
    private int failCount = 0;
    private LocalDateTime lockedUntil;

    private Boolean termsAgreed;
    private Boolean privacyAgreed;
    @Builder.Default
    private Boolean marketingAgreed = false;
    private LocalDateTime agreedAt;

    @PrePersist
    void prePersist() {
        if (role == null) {
            role = UserRole.USER;
        }
        if (membershipTier == null) {
            membershipTier = MembershipTier.FREE;
        }
    }

    public boolean isLocked() {
        return lockedUntil != null && lockedUntil.isAfter(LocalDateTime.now());
    }

    public void update(String userId, String email, String name) {
        if (userId != null) {
            this.userId = userId;
        }
        if (email != null) {
            this.email = email;
        }
        if (name != null) {
            this.name = name;
        }
    }

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void deactivate() {
        this.active = false;
    }

    public void clearLockState() {
        this.failCount = 0;
        this.lockedUntil = null;
    }

    public void updateProfile(String name, String profileImage, String info) {
        if (name != null) {
            this.name = name;
        }
        if (profileImage != null) {
            this.profileImage = profileImage;
        }
        if (info != null) {
            this.info = info;
        }
    }

    public void updateBlogSkin(BlogSkin blogSkin) {
        if (blogSkin != null) {
            this.blogSkin = blogSkin;
        }
    }

    /** 컬럼 추가 전 회원(null)도 기본 스킨으로 응답합니다. */
    public BlogSkin getBlogSkinOrDefault() {
        return blogSkin != null ? blogSkin : BlogSkin.DEFAULT;
    }
}

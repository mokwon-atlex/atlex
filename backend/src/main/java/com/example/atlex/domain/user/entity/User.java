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
@EntityListeners(AuditingEntityListener .class)
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

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
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
    }

    public boolean isLocked() {
        return lockedUntil != null && lockedUntil.isAfter(LocalDateTime.now());
    }

    public void update(String userId, String email, String name) {
        if (userId != null) { this.userId = userId; }
        if (email != null) { this.email = email; }
        if (name != null) { this.name = name; }
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
        if (name != null) { this.name = name; }
        if (profileImage != null) { this.profileImage = profileImage; }
        if (info != null) { this.info = info; }
    }
}

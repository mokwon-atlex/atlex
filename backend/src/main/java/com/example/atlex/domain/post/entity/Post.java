package com.example.atlex.domain.post.entity;

import com.example.atlex.domain.category.entity.Category;
import com.example.atlex.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EntityListeners(AuditingEntityListener.class)
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, length = 200)
    private String title;

    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private String thumbnailUrl;

    @Builder.Default
    @Column(nullable = false)
    private Integer hits = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer likes = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isDeleted = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isPublic = true;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public void update(
            String title,
            String description,
            String content,
            String thumbnailUrl,
            Boolean isPublic
    ) {
        if (title != null) this.title = title;
        if (description != null) this.description = description;
        if (content != null) this.content = content;
        if (thumbnailUrl != null) this.thumbnailUrl = thumbnailUrl;
        if (isPublic != null) this.isPublic = isPublic;
    }

    public void updateCategory(Category category) {
        this.category = category;
    }

    public void softDelete() {
        this.isDeleted = true;
    }
}

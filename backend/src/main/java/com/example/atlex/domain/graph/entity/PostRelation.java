package com.example.atlex.domain.graph.entity;

import com.example.atlex.domain.post.entity.Post;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
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
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "post_relations",
        indexes = {
                @Index(name = "idx_post_relations_source_score", columnList = "source_post_id, score"),
                @Index(name = "idx_post_relations_target", columnList = "target_post_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_post_relations_source_target", columnNames = {"source_post_id", "target_post_id"})
        }
)
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EntityListeners(AuditingEntityListener.class)
public class PostRelation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_post_id", nullable = false)
    private Post sourcePost;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "target_post_id", nullable = false)
    private Post targetPost;

    @Column(nullable = false)
    private Double score;

    @Column(nullable = false, length = 1000)
    private String sharedKeywords;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public static PostRelation of(Post sourcePost, Post targetPost, double score, String sharedKeywords) {
        return PostRelation.builder()
                .sourcePost(sourcePost)
                .targetPost(targetPost)
                .score(score)
                .sharedKeywords(sharedKeywords)
                .build();
    }
}

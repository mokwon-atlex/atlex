package com.example.atlex.domain.graph.entity;

import com.example.atlex.domain.post.entity.Post;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

@Entity
@Table(name = "post_keywords", indexes = {
    @Index(name = "idx_post_keywords_post_weight", columnList = "post_id, weight"),
    @Index(name = "idx_post_keywords_keyword_weight", columnList = "keyword_id, weight")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_post_keywords_post_keyword", columnNames = {"post_id", "keyword_id"})
})
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PostKeyword {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "keyword_id", nullable = false)
    private Keyword keyword;

    @Column(nullable = false)
    private Integer titleCount;

    @Column(nullable = false)
    private Integer contentCount;

    @Column(nullable = false)
    private Integer tagCount;

    @Column(nullable = false)
    private Double weight;

    public static PostKeyword of(
        Post post,
        Keyword keyword,
        int titleCount,
        int contentCount,
        int tagCount,
        double weight) {
        return PostKeyword.builder()
            .post(post)
            .keyword(keyword)
            .titleCount(titleCount)
            .contentCount(contentCount)
            .tagCount(tagCount)
            .weight(weight)
            .build();
    }
}

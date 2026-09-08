package com.example.atlex.domain.tag.entity;

import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "post_tags", indexes = {
    @Index(name = "idx_post_tags_user_id_tag_id", columnList = "user_id, tag_id"),
    @Index(name = "idx_post_tags_post_id", columnList = "post_id")
})
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PostTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;

    public static PostTag of(User user, Post post, Tag tag) {
        return PostTag.builder()
            .user(user)
            .post(post)
            .tag(tag)
            .build();
    }
}

package com.example.atlex.domain.post.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PostLikeResponse {

    private Long postId;
    private boolean liked;
    private Integer likes;

    public static PostLikeResponse of(Long postId, boolean liked, Integer likes) {
        return PostLikeResponse.builder()
                .postId(postId)
                .liked(liked)
                .likes(likes)
                .build();
    }
}

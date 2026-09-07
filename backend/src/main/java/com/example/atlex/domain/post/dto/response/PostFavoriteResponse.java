package com.example.atlex.domain.post.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PostFavoriteResponse {

    private Long postId;
    private boolean favorited;

    public static PostFavoriteResponse of(Long postId, boolean favorited) {
        return PostFavoriteResponse.builder()
            .postId(postId)
            .favorited(favorited)
            .build();
    }
}

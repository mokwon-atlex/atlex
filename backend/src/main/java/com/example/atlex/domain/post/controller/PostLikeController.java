package com.example.atlex.domain.post.controller;

import com.example.atlex.domain.post.dto.response.PostLikeResponse;
import com.example.atlex.domain.post.service.PostLikeService;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostLikeController implements PostLikeControllerDocs {

    private final PostLikeService postLikeService;

    @PostMapping("/{postId}/likes")
    public ResponseEntity<ApiResponse<PostLikeResponse>> like(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @PathVariable Long postId) {
        PostLikeResponse response = postLikeService.like(postId, principalDetails.user().getId());
        return ResponseEntity.ok(ApiResponse.success(response, "좋아요 상태가 변경되었습니다"));
    }

    @DeleteMapping("/{postId}/likes")
    public ResponseEntity<ApiResponse<PostLikeResponse>> unlike(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @PathVariable Long postId) {
        PostLikeResponse response = postLikeService.unlike(postId, principalDetails.user().getId());
        return ResponseEntity.ok(ApiResponse.success(response, "좋아요 상태가 변경되었습니다"));
    }
}

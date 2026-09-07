package com.example.atlex.domain.post.controller;

import com.example.atlex.domain.post.dto.response.PostFavoriteResponse;
import com.example.atlex.domain.post.dto.response.PostSummaryResponse;
import com.example.atlex.domain.post.service.PostFavoriteService;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostFavoriteController implements PostFavoriteControllerDocs {

    private final PostFavoriteService postFavoriteService;

    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<Page<PostSummaryResponse>>> getMyFavorites(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<PostSummaryResponse> response =
                postFavoriteService.getMyFavorites(principalDetails.user().getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{postId}/favorites")
    public ResponseEntity<ApiResponse<PostFavoriteResponse>> addFavorite(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @PathVariable Long postId) {
        PostFavoriteResponse response = postFavoriteService.addFavorite(postId, principalDetails.user().getId());
        return ResponseEntity.ok(ApiResponse.success(response, "즐겨찾기 상태가 변경되었습니다"));
    }

    @DeleteMapping("/{postId}/favorites")
    public ResponseEntity<ApiResponse<PostFavoriteResponse>> removeFavorite(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @PathVariable Long postId) {
        PostFavoriteResponse response = postFavoriteService.removeFavorite(postId, principalDetails.user().getId());
        return ResponseEntity.ok(ApiResponse.success(response, "즐겨찾기 상태가 변경되었습니다"));
    }
}

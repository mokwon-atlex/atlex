package com.example.atlex.domain.post.controller;

import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import com.example.atlex.domain.post.dto.request.PostCreateRequest;
import com.example.atlex.domain.post.dto.request.PostUpdateRequest;
import com.example.atlex.domain.post.dto.response.PostResponse;
import com.example.atlex.domain.post.dto.response.PostSummaryResponse;
import com.example.atlex.domain.post.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController implements PostControllerDocs {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @Valid @RequestBody PostCreateRequest request) {
        PostResponse response = postService.createPost(request, principalDetails.user().getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "게시글이 작성되었습니다"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostSummaryResponse>>> getPostList(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @RequestParam(defaultValue = "latest") String type,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) Long categoryId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Long id = principalDetails != null ? principalDetails.user().getId() : null;
        Page<PostSummaryResponse> response = postService.getPostList(type, userId, categoryId, pageable, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostResponse>> getPost(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @PathVariable Long postId) {
        Long id = principalDetails != null ? principalDetails.user().getId() : null;
        PostResponse response = postService.getPost(postId, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @PathVariable Long postId,
            @Valid @RequestBody PostUpdateRequest request) {
        PostResponse response = postService.updatePost(postId, request, principalDetails.user().getId());
        return ResponseEntity.ok(ApiResponse.success(response, "게시글이 수정되었습니다"));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @PathVariable Long postId) {
        postService.deletePost(postId, principalDetails.user().getId());
        return ResponseEntity.noContent().build();
    }
}

package com.example.atlex.domain.comment.controller;

import com.example.atlex.domain.comment.dto.request.CommentCreateRequest;
import com.example.atlex.domain.comment.dto.request.CommentUpdateRequest;
import com.example.atlex.domain.comment.dto.response.CommentResponse;
import com.example.atlex.domain.comment.service.CommentService;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CommentController implements CommentControllerDocs {

    private final CommentService commentService;

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @PathVariable Long postId,
            @Valid @RequestBody CommentCreateRequest request) {
        CommentResponse response = commentService.createComment(postId, request, principalDetails.user().getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "댓글이 작성되었습니다"));
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @PathVariable Long postId) {
        Long id = principalDetails != null ? principalDetails.user().getId() : null;
        List<CommentResponse> response = commentService.getComments(postId, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentUpdateRequest request) {
        CommentResponse response = commentService.updateComment(commentId, request, principalDetails.user().getId());
        return ResponseEntity.ok(ApiResponse.success(response, "댓글이 수정되었습니다"));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @PathVariable Long commentId) {
        commentService.deleteComment(commentId, principalDetails.user().getId());
        return ResponseEntity.noContent().build();
    }
}

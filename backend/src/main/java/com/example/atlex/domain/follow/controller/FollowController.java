package com.example.atlex.domain.follow.controller;

import com.example.atlex.domain.auth.exception.AuthenticationException;
import com.example.atlex.domain.follow.dto.response.FollowStatusResponse;
import com.example.atlex.domain.follow.dto.response.FollowUserResponse;
import com.example.atlex.domain.follow.service.FollowService;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 팔로우 등록·해제 및 팔로워/팔로잉 목록 조회 엔드포인트.
 */
@RestController
@RequestMapping("/api/v1/profiles/{userId}")
@RequiredArgsConstructor
public class FollowController implements FollowControllerDocs {

    private final FollowService followService;

    @Override
    @PostMapping("/follow")
    public ResponseEntity<ApiResponse<FollowStatusResponse>> follow(
        @PathVariable
        String userId,
        @AuthenticationPrincipal
        PrincipalDetails principalDetails) {
        if (principalDetails == null) {
            throw new AuthenticationException();
        }
        FollowStatusResponse response = followService.follow(userId, principalDetails.user());
        return ResponseEntity.ok(ApiResponse.success(response, "팔로우 성공"));
    }

    @Override
    @DeleteMapping("/follow")
    public ResponseEntity<ApiResponse<FollowStatusResponse>> unfollow(
        @PathVariable
        String userId,
        @AuthenticationPrincipal
        PrincipalDetails principalDetails) {
        if (principalDetails == null) {
            throw new AuthenticationException();
        }
        FollowStatusResponse response = followService.unfollow(userId, principalDetails.user());
        return ResponseEntity.ok(ApiResponse.success(response, "언팔로우 성공"));
    }

    @Override
    @GetMapping("/followers")
    public ResponseEntity<ApiResponse<List<FollowUserResponse>>> getFollowers(@PathVariable
    String userId) {
        return ResponseEntity.ok(ApiResponse.success(followService.getFollowers(userId), null));
    }

    @Override
    @GetMapping("/following")
    public ResponseEntity<ApiResponse<List<FollowUserResponse>>> getFollowing(@PathVariable
    String userId) {
        return ResponseEntity.ok(ApiResponse.success(followService.getFollowing(userId), null));
    }
}

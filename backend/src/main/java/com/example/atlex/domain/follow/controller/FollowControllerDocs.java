package com.example.atlex.domain.follow.controller;

import com.example.atlex.domain.follow.dto.response.FollowStatusResponse;
import com.example.atlex.domain.follow.dto.response.FollowUserResponse;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(name = "Follow", description = "팔로우 및 팔로워/팔로잉 목록 API")
public interface FollowControllerDocs {

    @Operation(summary = "사용자 팔로우", description = "대상 사용자를 팔로우합니다. Authorization 헤더 필수.")
    @SecurityRequirement(name = "bearerAuth")
    ResponseEntity<ApiResponse<FollowStatusResponse>> follow(
        @Parameter(description = "대상 사용자 아이디", example = "john123") @PathVariable String userId,
        @AuthenticationPrincipal PrincipalDetails principalDetails);

    @Operation(summary = "사용자 언팔로우", description = "대상 사용자 팔로우를 해제합니다. Authorization 헤더 필수.")
    @SecurityRequirement(name = "bearerAuth")
    ResponseEntity<ApiResponse<FollowStatusResponse>> unfollow(
        @Parameter(description = "대상 사용자 아이디", example = "john123") @PathVariable String userId,
        @AuthenticationPrincipal PrincipalDetails principalDetails);

    @Operation(summary = "팔로워 목록 조회", description = "대상 사용자를 팔로우하는 사용자 목록을 조회합니다.")
    ResponseEntity<ApiResponse<List<FollowUserResponse>>> getFollowers(
        @Parameter(description = "대상 사용자 아이디", example = "john123") @PathVariable String userId);

    @Operation(summary = "팔로잉 목록 조회", description = "대상 사용자가 팔로우하는 사용자 목록을 조회합니다.")
    ResponseEntity<ApiResponse<List<FollowUserResponse>>> getFollowing(
        @Parameter(description = "대상 사용자 아이디", example = "john123") @PathVariable String userId);
}

package com.example.atlex.domain.follow.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 팔로우/언팔로우 처리 후 최신 팔로우 상태와 카운트를 반환하는 응답 DTO.
 */
@Schema(description = "팔로우 상태 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowStatusResponse {

    @Schema(description = "대상 사용자 아이디", example = "john123")
    private String userId;

    @Schema(description = "현재 로그인 사용자의 팔로우 여부", example = "true")
    private boolean following;

    @Schema(description = "대상 사용자의 팔로워 수", example = "12")
    private long followerCount;

    @Schema(description = "대상 사용자의 팔로잉 수", example = "5")
    private long followingCount;
}

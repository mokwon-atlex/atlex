package com.example.atlex.domain.follow.dto.response;

import com.example.atlex.domain.user.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 팔로워/팔로잉 목록에 표시할 사용자 요약 정보 DTO.
 */
@Schema(description = "팔로우 목록 사용자 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowUserResponse {

    @Schema(description = "사용자 DB ID", example = "1")
    private Long id;

    @Schema(description = "로그인용 아이디", example = "john123")
    private String userId;

    @Schema(description = "닉네임", example = "홍길동")
    private String name;

    @Schema(description = "프로필 이미지 URL", example = "https://example.com/images/profile.jpg")
    private String profileImage;

    @Schema(description = "자기소개", example = "안녕하세요, 백엔드 개발자입니다.")
    private String info;

    public static FollowUserResponse from(User user) {
        return FollowUserResponse.builder()
            .id(user.getId())
            .userId(user.getUserId())
            .name(user.getName())
            .profileImage(user.getProfileImage())
            .info(user.getInfo())
            .build();
    }
}

package com.example.atlex.domain.profile.dto.response;

import com.example.atlex.domain.user.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "공개 프로필 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicUserResponse {
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

    public static PublicUserResponse from(User user) {
        return PublicUserResponse.builder()
            .id(user.getId())
            .userId(user.getUserId())
            .name(user.getName())
            .profileImage(user.getProfileImage())
            .info(user.getInfo())
            .build();
    }
}

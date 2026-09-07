package com.example.atlex.domain.profile.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(description = "프로필 수정 요청 (수정할 필드만 전송)")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {

    @Schema(description = "변경할 닉네임 (최대 50자)", example = "새닉네임")
    @Size(max = 50, message = "name은 최대 50자까지 입력할 수 있습니다.")
    @Pattern(regexp = "^(?!\\s*$).+", message = "name은 빈 값일 수 없습니다.")
    private String name;

    @Schema(description = "변경할 프로필 이미지 URL (최대 255자)", example = "https://example.com/images/new_profile.jpg")
    @Size(max = 255, message = "profileImage는 최대 255자까지 입력할 수 있습니다.")
    private String profileImage;

    @Schema(description = "변경할 자기소개 (최대 255자)", example = "안녕하세요, 풀스택 개발자입니다.")
    @Size(max = 255, message = "info는 최대 255자까지 입력할 수 있습니다.")
    private String info;
}

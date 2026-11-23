package com.example.atlex.domain.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 신규 소셜 사용자의 초기 프로필 및 약관 동의를 완료하는 온보딩 요청 DTO입니다.
 */
@Schema(description = "OAuth2 신규 사용자 온보딩 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OAuth2OnboardingRequest {

    @Schema(description = "OAuth2 콜백으로 전달된 일회용 온보딩 토큰", example = "550e8400-e29b-41d4-a716-446655440000")
    @NotBlank(message = "온보딩 토큰을 입력해주세요.")
    private String onboardingToken;

    @Schema(description = "블로그 핸들/아이디 (4~15자, 공백 불가)", example = "john123")
    @NotBlank(message = "아이디를 입력해주세요.")
    @Size(min = 4, max = 15, message = "아이디는 4자 이상 15자 이하로 입력해주세요.")
    @Pattern(regexp = "^[^\\s]+$", message = "아이디에 공백을 포함할 수 없습니다.")
    private String userId;

    @Schema(description = "닉네임 (2~10자, 한글/영문/숫자만 허용)", example = "홍길동")
    @NotBlank(message = "닉네임을 입력해주세요.")
    @Size(min = 2, max = 10, message = "닉네임은 2자 이상 10자 이하로 입력해주세요.")
    @Pattern(regexp = "^[a-zA-Z가-힣0-9]*$", message = "한글, 영어, 숫자만 입력 가능하며 특수문자는 사용할 수 없습니다.")
    private String name;

    @Schema(description = "이메일 (소셜 제공자가 이메일을 제공하지 않은 경우 입력)", example = "john@example.com")
    @Email(message = "이메일 형식(예: user@example.com)을 확인해주세요.")
    private String email;

    @Schema(description = "이용약관 동의 (필수)", example = "true")
    private Boolean termsAgreed;

    @Schema(description = "개인정보처리방침 동의 (필수)", example = "true")
    private Boolean privacyAgreed;

    @Schema(description = "마케팅 수신 동의 (선택, 기본값 false)", example = "false")
    private Boolean marketingAgreed = false;
}

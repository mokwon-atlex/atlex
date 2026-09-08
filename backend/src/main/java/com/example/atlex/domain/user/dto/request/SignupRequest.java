package com.example.atlex.domain.user.dto.request;
//클라이언트 입력 데이터

import com.example.atlex.domain.user.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(description = "회원가입 요청")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    @Schema(description = "아이디 (4~15자, 공백 불가)", example = "john123")
    @NotBlank(message = "아이디를 입력해주세요.")
    @Size(min = 4, max = 15, message = "아이디는 4자 이상 15자 이하로 입력해주세요.")
    @Pattern(regexp = "^[^\\s]+$", message = "아이디에 공백을 포함할 수 없습니다.")
    private String userId;

    @Schema(description = "이메일", example = "john@example.com")
    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "이메일 형식(예: user@example.com)을 확인해주세요.")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$", message = "이메일 형식(예: user@example.com)을 확인해주세요.")
    private String email;

    @Schema(description = "비밀번호 (8~16자, 영문+숫자+특수문자 포함)", example = "Password1!")
    @NotBlank(message = "비밀번호를 입력해주세요.")
    @Size(min = 8, max = 16, message = "비밀번호는 최소 8자 이상 16자 이하로 입력해주세요.")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$", message = "비밀번호는 영문, 숫자, 특수문자를 각 최소 하나 이상 포함해야 합니다.")
    private String password;

    @Schema(description = "닉네임 (2~10자, 한글/영문/숫자만 허용)", example = "홍길동")
    @NotBlank(message = "닉네임을 입력해주세요.")
    @Size(min = 2, max = 10, message = "닉네임은 2자 이상 10자 이하로 입력해주세요.")
    @Pattern(regexp = "^[a-zA-Z가-힣0-9]*$", message = "한글, 영어, 숫자만 입력 가능하며 특수문자는 사용할 수 없습니다.")
    private String name;

    @Schema(description = "이용약관 동의 (필수)", example = "true")
    private Boolean termsAgreed;

    @Schema(description = "개인정보처리방침 동의 (필수)", example = "true")
    private Boolean privacyAgreed;

    @Schema(description = "마케팅 수신 동의 (선택, 기본값 false)", example = "false")
    private Boolean marketingAgreed = false;

    public User toEntity(String encodedPassword) {
        return User.builder()
            .userId(this.userId)
            .email(this.email)
            .password(encodedPassword)
            .name(this.name)
            .termsAgreed(this.termsAgreed)
            .privacyAgreed(this.privacyAgreed)
            .marketingAgreed(this.marketingAgreed != null ? this.marketingAgreed : false)
            .agreedAt(java.time.LocalDateTime.now())
            .build();
    }
}

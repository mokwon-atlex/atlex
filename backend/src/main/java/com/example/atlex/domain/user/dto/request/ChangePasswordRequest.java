package com.example.atlex.domain.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(description = "비밀번호 변경 요청")
@Getter
@Setter
@NoArgsConstructor
public class ChangePasswordRequest {

    @Schema(description = "현재 비밀번호", example = "OldPass1!")
    @NotBlank(message = "현재 비밀번호를 입력해주세요.")
    private String currentPassword;

    @Schema(description = "새 비밀번호 (8~16자, 영문+숫자+특수문자 포함)", example = "NewPass2@")
    @NotBlank(message = "변경할 비밀번호를 입력해주세요.")
    @Size(min = 8, max = 16, message = "비밀번호는 최소 8자 이상 16자 이하로 입력해주세요.")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$",
            message = "비밀번호는 영문, 숫자, 특수문자를 각 최소 하나 이상 포함해야 합니다."
    )
    private String newPassword;
}

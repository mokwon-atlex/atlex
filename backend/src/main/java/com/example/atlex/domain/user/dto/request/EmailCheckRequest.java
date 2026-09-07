package com.example.atlex.domain.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(description = "이메일 중복 확인 요청")
@Getter
@Setter
@NoArgsConstructor
public class EmailCheckRequest {

    @Schema(description = "중복 확인할 이메일", example = "john@example.com")
    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "이메일 형식(예: user@example.com)을 확인해주세요.")
    @Pattern(
            regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$",
            message = "이메일 형식(예: user@example.com)을 확인해주세요."
    )
    private String email;
}

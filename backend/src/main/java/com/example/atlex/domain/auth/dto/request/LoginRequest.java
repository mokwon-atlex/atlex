package com.example.atlex.domain.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Schema(description = "로그인 요청")
@Getter
public class LoginRequest {

    @Schema(description = "사용자 아이디 (4~15자, 공백 불가)", example = "john123")
    @NotBlank(message = "아이디를 입력해주세요")
    private String userId;

    @Schema(description = "비밀번호 (8~16자, 영문+숫자+특수문자 포함)", example = "Password1!")
    @NotBlank(message = "비밀번호를 입력해주세요")
    private String password;
}

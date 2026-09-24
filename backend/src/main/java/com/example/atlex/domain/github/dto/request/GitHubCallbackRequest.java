package com.example.atlex.domain.github.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * GitHub OAuth 인가 코드(code) 전달 요청 DTO입니다.
 */
@Schema(description = "GitHub OAuth 인가 코드 전달 요청")
@Getter
@NoArgsConstructor
public class GitHubCallbackRequest {

    @Schema(description = "GitHub OAuth redirect 시 전달받은 인가 코드", example = "e57823f6629918a2bc4e")
    @NotBlank(message = "인가 코드는 필수입니다.")
    private String code;

    @NotBlank(message = "OAuth state 값은 필수입니다.")
    @Schema(description = "OAuth CSRF 방지용 state 토큰", example = "ENCRYPTED_STATE_TOKEN")
    private String state;

    public GitHubCallbackRequest(String code) {
        this.code = code;
    }

    public GitHubCallbackRequest(String code, String state) {
        this.code = code;
        this.state = state;
    }
}

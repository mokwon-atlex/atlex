package com.example.atlex.domain.github.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * GitHub OAuth 로그인 인가 URL 응답 DTO입니다.
 */
@Schema(description = "GitHub OAuth 로그인 URL 응답")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GitHubOAuthUrlResponse {

    @Schema(description = "사용자를 리다이렉트할 GitHub OAuth 인가 URL", example = "https://github.com/login/oauth/authorize?client_id=...")
    private String url;
}

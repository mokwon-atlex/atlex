package com.example.atlex.domain.auth.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "JWT 토큰 응답")
@Getter
@Builder
@AllArgsConstructor
public class TokenResponse {
    @Schema(description = "액세스 토큰 (Authorization: Bearer {token})", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String accessToken;

    @Schema(description = "리프레시 토큰 (토큰 재발급 시 사용)", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String refreshToken;

    @Schema(description = "사용자 아이디", example = "john123")
    private String userId;
}

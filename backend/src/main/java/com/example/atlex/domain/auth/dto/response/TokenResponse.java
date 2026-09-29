package com.example.atlex.domain.auth.dto.response;

import com.example.atlex.domain.user.entity.UserRole;
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

    /** 화면에서 관리자 메뉴 노출 여부를 판단하기 위한 권한. 실제 권한 검사는 서버에서 수행한다. */
    @Schema(description = "사용자 권한 (USER, ADMIN)", example = "USER")
    private UserRole role;
}

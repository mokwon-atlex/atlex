package com.example.atlex.domain.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * OAuth2 일회용 인가 코드를 JWT 토큰으로 교환하기 위한 요청 DTO입니다.
 */
@Schema(description = "OAuth2 일회용 코드 교환 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OAuth2ExchangeRequest {

    @Schema(description = "OAuth2 콜백으로 전달된 일회용 코드", example = "550e8400-e29b-41d4-a716-446655440000")
    @NotBlank(message = "인증 코드를 입력해주세요.")
    private String code;
}

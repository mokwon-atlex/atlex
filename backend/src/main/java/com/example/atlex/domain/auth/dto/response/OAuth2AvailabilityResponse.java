package com.example.atlex.domain.auth.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 온보딩 단계에서 아이디·닉네임 사용 가능 여부를 반환하는 응답 DTO입니다.
 */
@Schema(description = "온보딩 아이디·닉네임 중복 확인 응답")
public record OAuth2AvailabilityResponse(
    @Schema(description = "아이디 사용 가능 여부 (요청하지 않은 경우 null)", example = "true")
    Boolean userIdAvailable,
    @Schema(description = "닉네임 사용 가능 여부 (요청하지 않은 경우 null)", example = "true")
    Boolean nameAvailable) {
}

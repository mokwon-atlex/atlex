package com.example.atlex.domain.auth.oauth2;

import com.example.atlex.domain.auth.entity.SocialProvider;

/**
 * 신규 소셜 사용자의 온보딩 완료 전 Redis에 임시 보관하는 정보입니다.
 */
public record OAuth2OnboardingPayload(
    SocialProvider provider,
    String providerId,
    String email,
    String suggestedName) {
}

package com.example.atlex.domain.auth.entity;

import java.util.Arrays;

/**
 * 지원하는 OAuth2 소셜 로그인 제공자 목록입니다.
 */
public enum SocialProvider {
    GITHUB("github"),
    GOOGLE("google"),
    KAKAO("kakao");

    private final String registrationId;

    SocialProvider(String registrationId) {
        this.registrationId = registrationId;
    }

    public String getRegistrationId() {
        return registrationId;
    }

    /**
     * Spring Security OAuth2 registrationId로 {@link SocialProvider}를 조회합니다.
     *
     * @param registrationId 클라이언트 등록 ID (예: github, google, kakao)
     * @return 매칭되는 소셜 제공자
     * @throws IllegalArgumentException 지원하지 않는 제공자인 경우
     */
    public static SocialProvider fromRegistrationId(String registrationId) {
        if (registrationId == null) {
            throw new IllegalArgumentException("OAuth2 registrationId가 비어 있습니다.");
        }
        return Arrays.stream(values())
            .filter(provider -> provider.registrationId.equalsIgnoreCase(registrationId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("지원하지 않는 OAuth2 제공자입니다: " + registrationId));
    }
}

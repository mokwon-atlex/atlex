package com.example.atlex.domain.auth.oauth2;

import com.example.atlex.domain.auth.entity.SocialProvider;

import java.util.Map;

/**
 * OAuth2 소셜 제공자별 사용자 속성 응답을 공통 규격으로 추상화한 인터페이스입니다.
 */
public interface OAuth2UserInfo {

    SocialProvider getProvider();

    String getProviderId();

    String getEmail();

    String getName();

    /**
     * registrationId에 맞는 {@link OAuth2UserInfo} 구현체를 생성합니다.
     *
     * @param registrationId Spring Security OAuth2 클라이언트 등록 ID
     * @param attributes 제공자로부터 받은 사용자 속성 맵
     * @return 정규화된 소셜 사용자 정보
     */
    static OAuth2UserInfo of(String registrationId, Map<String, Object> attributes) {
        SocialProvider provider = SocialProvider.fromRegistrationId(registrationId);
        return switch (provider) {
            case GITHUB -> new GitHubOAuth2UserInfo(attributes);
            case GOOGLE -> new GoogleOAuth2UserInfo(attributes);
            case KAKAO -> new KakaoOAuth2UserInfo(attributes);
        };
    }
}

package com.example.atlex.domain.auth.oauth2;

import com.example.atlex.domain.auth.entity.SocialProvider;

import java.util.Map;

/**
 * Kakao OAuth2 사용자 응답({@code /v2/user/me}) 파서입니다.
 */
public class KakaoOAuth2UserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;

    public KakaoOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public SocialProvider getProvider() {
        return SocialProvider.KAKAO;
    }

    @Override
    public String getProviderId() {
        Object id = attributes.get("id");
        return id != null ? String.valueOf(id) : null;
    }

    @Override
    @SuppressWarnings("unchecked")
    public String getEmail() {
        Object accountObj = attributes.get("kakao_account");
        if (!(accountObj instanceof Map<?, ?> account)) {
            return null;
        }
        Object email = ((Map<String, Object>)account).get("email");
        return email instanceof String s ? s : null;
    }

    @Override
    @SuppressWarnings("unchecked")
    public String getName() {
        Object accountObj = attributes.get("kakao_account");
        if (!(accountObj instanceof Map<?, ?> account)) {
            return null;
        }
        Object profileObj = ((Map<String, Object>)account).get("profile");
        if (!(profileObj instanceof Map<?, ?> profile)) {
            return null;
        }
        Object nickname = ((Map<String, Object>)profile).get("nickname");
        return nickname instanceof String s ? s : null;
    }
}

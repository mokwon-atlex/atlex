package com.example.atlex.domain.auth.oauth2;

import com.example.atlex.domain.auth.entity.SocialProvider;

import java.util.Map;

/**
 * Google OAuth2 사용자 응답 파서입니다.
 */
public class GoogleOAuth2UserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;

    public GoogleOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public SocialProvider getProvider() {
        return SocialProvider.GOOGLE;
    }

    @Override
    public String getProviderId() {
        Object sub = attributes.get("sub");
        return sub != null ? String.valueOf(sub) : null;
    }

    @Override
    public String getEmail() {
        Object email = attributes.get("email");
        return email instanceof String s ? s : null;
    }

    @Override
    public String getName() {
        Object name = attributes.get("name");
        return name instanceof String s ? s : null;
    }
}

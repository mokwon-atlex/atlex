package com.example.atlex.domain.auth.oauth2;

import com.example.atlex.domain.auth.entity.SocialProvider;

import java.util.Map;

/**
 * GitHub OAuth2 사용자 응답({@code /user}) 파서입니다.
 */
public class GitHubOAuth2UserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;

    public GitHubOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public SocialProvider getProvider() {
        return SocialProvider.GITHUB;
    }

    @Override
    public String getProviderId() {
        Object id = attributes.get("id");
        return id != null ? String.valueOf(id) : null;
    }

    @Override
    public String getEmail() {
        Object email = attributes.get("email");
        return email instanceof String s ? s : null;
    }

    @Override
    public String getName() {
        Object name = attributes.get("name");
        if (name instanceof String s && !s.isBlank()) {
            return s;
        }
        Object login = attributes.get("login");
        return login instanceof String s ? s : null;
    }
}

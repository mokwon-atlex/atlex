package com.example.atlex.domain.auth.oauth2;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * OAuth2 인증 직후 SuccessHandler로 전달되는 소셜 사용자 Principal입니다.
 */
public class CustomOAuth2User implements OAuth2User {

    private final OAuth2UserInfo userInfo;
    private final Map<String, Object> attributes;
    private final Long userId;
    private final boolean newUser;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomOAuth2User(
        OAuth2UserInfo userInfo,
        Map<String, Object> attributes,
        Long userId,
        boolean newUser,
        String roleName) {
        this.userInfo = userInfo;
        this.attributes = attributes;
        this.userId = userId;
        this.newUser = newUser;
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roleName));
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getName() {
        return userInfo.getProvider().name() + ":" + userInfo.getProviderId();
    }

    public OAuth2UserInfo getUserInfo() {
        return userInfo;
    }

    public Long getUserId() {
        return userId;
    }

    public boolean isNewUser() {
        return newUser;
    }
}

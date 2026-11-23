package com.example.atlex.domain.auth.oauth2;

import com.example.atlex.domain.auth.entity.SocialAccount;
import com.example.atlex.domain.auth.repository.SocialAccountRepository;
import com.example.atlex.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * OAuth2 제공자로부터 사용자 정보를 조회하고 기존 연동 계정 여부를 판별하는 서비스입니다.
 */
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final SocialAccountRepository socialAccountRepository;

    @Override
    @Transactional(readOnly = true)
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User delegateUser = fetchDelegateUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        return resolveOAuth2User(registrationId, delegateUser);
    }

    protected OAuth2User fetchDelegateUser(OAuth2UserRequest userRequest) {
        return super.loadUser(userRequest);
    }

    CustomOAuth2User resolveOAuth2User(String registrationId, OAuth2User delegateUser) {
        OAuth2UserInfo userInfo;
        try {
            userInfo = OAuth2UserInfo.of(registrationId, delegateUser.getAttributes());
        } catch (IllegalArgumentException e) {
            throw new OAuth2AuthenticationException(new OAuth2Error("unsupported_provider"), e.getMessage());
        }

        if (userInfo.getProviderId() == null || userInfo.getProviderId().isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_user_info"), "소셜 식별자가 없습니다.");
        }

        Optional<SocialAccount> existing = socialAccountRepository.findByProviderAndProviderIdWithUser(
            userInfo.getProvider(),
            userInfo.getProviderId());

        if (existing.isEmpty()) {
            return new CustomOAuth2User(userInfo, delegateUser.getAttributes(), null, true, "USER");
        }

        User user = existing.get().getUser();
        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new OAuth2AuthenticationException(new OAuth2Error("account_disabled"), "비활성화된 계정입니다.");
        }
        if (user.isLocked()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("account_locked"), "잠긴 계정입니다.");
        }

        return new CustomOAuth2User(
            userInfo,
            delegateUser.getAttributes(),
            user.getId(),
            false,
            user.getRole().name());
    }
}

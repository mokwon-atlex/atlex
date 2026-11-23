package com.example.atlex.domain.auth.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * OAuth2 인증 성공 시 일회용 코드(기존 사용자) 또는 온보딩 토큰(신규 사용자)을 발급해 프론트엔드로 리다이렉트합니다.
 */
@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final OAuth2CodeStore oAuth2CodeStore;
    private final String redirectUri;

    public OAuth2AuthenticationSuccessHandler(
        OAuth2CodeStore oAuth2CodeStore,
        @Value("${app.oauth2.redirect-uri}")
        String redirectUri) {
        this.oAuth2CodeStore = oAuth2CodeStore;
        this.redirectUri = redirectUri;
    }

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication) throws IOException {
        CustomOAuth2User principal = (CustomOAuth2User)authentication.getPrincipal();
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(redirectUri);

        if (!principal.isNewUser() && principal.getUserId() != null) {
            String code = oAuth2CodeStore.issueLoginCode(principal.getUserId());
            builder.queryParam("code", code);
        } else {
            OAuth2UserInfo userInfo = principal.getUserInfo();
            String onboardingToken = oAuth2CodeStore.issueOnboardingToken(
                new OAuth2OnboardingPayload(
                    userInfo.getProvider(),
                    userInfo.getProviderId(),
                    userInfo.getEmail(),
                    userInfo.getName()));
            builder.queryParam("onboardingToken", onboardingToken)
                .queryParam("provider", userInfo.getProvider().name());
            if (userInfo.getName() != null && !userInfo.getName().isBlank()) {
                builder.queryParam("suggestedName", userInfo.getName());
            }
            if (userInfo.getEmail() != null && !userInfo.getEmail().isBlank()) {
                builder.queryParam("email", userInfo.getEmail());
            }
        }

        String targetUrl = builder.encode().build().toUriString();
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

package com.example.atlex.domain.auth.oauth2;

import com.example.atlex.domain.auth.entity.SocialAccount;
import com.example.atlex.domain.auth.entity.SocialProvider;
import com.example.atlex.domain.auth.repository.SocialAccountRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.entity.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomOAuth2UserServiceTest {

    @Mock
    SocialAccountRepository socialAccountRepository;

    private CustomOAuth2UserService service;

    @BeforeEach
    void setUp() {
        service = new CustomOAuth2UserService(socialAccountRepository);
    }

    private OAuth2User googleDelegate(String sub, String email, String name) {
        return new DefaultOAuth2User(
            List.of(new SimpleGrantedAuthority("ROLE_USER")),
            Map.of("sub", sub, "email", email, "name", name),
            "sub");
    }

    @Test
    @DisplayName("미연동 소셜 사용자는 newUser=true로 반환된다")
    void 신규_소셜_사용자_분기() {
        when(socialAccountRepository.findByProviderAndProviderIdWithUser(SocialProvider.GOOGLE, "sub-1"))
            .thenReturn(Optional.empty());

        CustomOAuth2User result = service.resolveOAuth2User("google", googleDelegate("sub-1", "a@gmail.com", "테스터"));

        assertTrue(result.isNewUser());
        assertNull(result.getUserId());
        assertEquals(SocialProvider.GOOGLE, result.getUserInfo().getProvider());
    }

    @Test
    @DisplayName("기존 연동 활성 사용자는 newUser=false와 내부 userId를 반환한다")
    void 기존_소셜_사용자_분기() {
        User user = User.builder()
            .id(42L)
            .userId("atlexuser")
            .active(true)
            .role(UserRole.USER)
            .build();
        SocialAccount account = SocialAccount.builder()
            .user(user)
            .provider(SocialProvider.GOOGLE)
            .providerId("sub-1")
            .email("a@gmail.com")
            .build();
        when(socialAccountRepository.findByProviderAndProviderIdWithUser(SocialProvider.GOOGLE, "sub-1"))
            .thenReturn(Optional.of(account));

        CustomOAuth2User result = service.resolveOAuth2User("google", googleDelegate("sub-1", "a@gmail.com", "테스터"));

        assertFalse(result.isNewUser());
        assertEquals(42L, result.getUserId());
    }

    @Test
    @DisplayName("비활성화된 소셜 연동 계정은 OAuth2AuthenticationException을 던진다")
    void 비활성_소셜_계정_차단() {
        User user = User.builder()
            .id(42L)
            .userId("atlexuser")
            .active(false)
            .role(UserRole.USER)
            .build();
        SocialAccount account = SocialAccount.builder()
            .user(user)
            .provider(SocialProvider.GOOGLE)
            .providerId("sub-1")
            .build();
        when(socialAccountRepository.findByProviderAndProviderIdWithUser(SocialProvider.GOOGLE, "sub-1"))
            .thenReturn(Optional.of(account));

        OAuth2AuthenticationException ex = assertThrows(
            OAuth2AuthenticationException.class,
            () -> service.resolveOAuth2User("google", googleDelegate("sub-1", "a@gmail.com", "테스터")));
        assertEquals("account_disabled", ex.getError().getErrorCode());
    }
}

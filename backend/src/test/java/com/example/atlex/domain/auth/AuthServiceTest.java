package com.example.atlex.domain.auth;

import com.example.atlex.domain.auth.dto.request.OAuth2OnboardingRequest;
import com.example.atlex.domain.auth.dto.response.TokenResponse;
import com.example.atlex.domain.auth.entity.SocialAccount;
import com.example.atlex.domain.auth.entity.SocialProvider;
import com.example.atlex.domain.auth.exception.AuthenticationException;
import com.example.atlex.domain.auth.exception.TooManyLoginAttemptsException;
import com.example.atlex.domain.auth.oauth2.OAuth2CodeStore;
import com.example.atlex.domain.auth.oauth2.OAuth2OnboardingPayload;
import com.example.atlex.domain.auth.repository.RefreshTokenRepository;
import com.example.atlex.domain.auth.repository.SocialAccountRepository;
import com.example.atlex.domain.auth.service.AuthService;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.entity.UserRole;
import com.example.atlex.domain.user.service.UserReader;
import com.example.atlex.global.exception.AccessDeniedException;
import com.example.atlex.global.security.jwt.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    UserReader userReader;
    @Mock
    SocialAccountRepository socialAccountRepository;
    @Mock
    OAuth2CodeStore oAuth2CodeStore;
    @Mock
    PasswordEncoder passwordEncoder;
    @Mock
    JwtProvider jwtProvider;
    @Mock
    RefreshTokenRepository tokenRepository;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
            userReader,
            socialAccountRepository,
            oAuth2CodeStore,
            passwordEncoder,
            jwtProvider,
            tokenRepository);
    }

    private User activeUser(int failCount) {
        return User.builder()
            .id(1L)
            .userId("testUser")
            .password("encoded")
            .active(true)
            .failCount(failCount)
            .build();
    }

    @Test
    @DisplayName("비밀번호 틀리면 UserReader를 통해 failCount 증가 후 예외")
    void 비밀번호_실패시_failCount_증가_저장() {
        User user = activeUser(0);
        when(userReader.findByUserId("testUser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        assertThrows(AuthenticationException.class,
            () -> authService.login("testUser", "wrong"));

        verify(userReader).incrementLoginFailure(eq(1L), eq(5), any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("5회 실패 시 잠금 처리 호출")
    void 다섯번_실패시_계정_잠금() {
        User user = activeUser(4);
        when(userReader.findByUserId("testUser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        assertThrows(AuthenticationException.class,
            () -> authService.login("testUser", "wrong"));

        verify(userReader).incrementLoginFailure(eq(1L), eq(5), any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("비밀번호가 없는 소셜 계정은 일반 로그인 시 실패 처리 후 AuthenticationException")
    void 소셜계정_비밀번호_로그인_차단() {
        User socialOnly = User.builder()
            .id(2L)
            .userId("socialUser")
            .password(null)
            .active(true)
            .failCount(0)
            .build();
        when(userReader.findByUserId("socialUser")).thenReturn(Optional.of(socialOnly));

        assertThrows(AuthenticationException.class,
            () -> authService.login("socialUser", "any"));

        verify(passwordEncoder, never()).matches(any(), any());
        verify(userReader).incrementLoginFailure(eq(2L), eq(5), any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("로그인 성공 시 failCount 와 lockedUntil 초기화")
    void 로그인_성공시_실패정보_초기화() {
        User user = activeUser(3);
        when(userReader.findByUserId("testUser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct", "encoded")).thenReturn(true);
        when(jwtProvider.createAccessToken(1L)).thenReturn("access");
        when(jwtProvider.createRefreshToken(1L)).thenReturn("refresh");
        when(tokenRepository.findById(1L)).thenReturn(Optional.empty());

        authService.login("testUser", "correct");

        assertEquals(0, user.getFailCount());
        assertNull(user.getLockedUntil());
    }

    @Test
    @DisplayName("로그인 성공 응답에 사용자 권한을 포함한다")
    void 로그인_성공시_권한_반환() {
        User admin = User.builder()
            .id(1L)
            .userId("testUser")
            .password("encoded")
            .active(true)
            .failCount(0)
            .role(UserRole.ADMIN)
            .build();
        when(userReader.findByUserId("testUser")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("correct", "encoded")).thenReturn(true);
        when(jwtProvider.createAccessToken(1L)).thenReturn("access");
        when(jwtProvider.createRefreshToken(1L)).thenReturn("refresh");
        when(tokenRepository.findById(1L)).thenReturn(Optional.empty());

        TokenResponse response = authService.login("testUser", "correct");

        assertEquals(UserRole.ADMIN, response.getRole());
    }

    @Test
    @DisplayName("잠긴 계정 로그인 시 TooManyLoginAttemptsException")
    void 잠긴계정_로그인_예외() {
        User user = activeUser(5);
        user.lockUntil(LocalDateTime.now().plusMinutes(10));
        when(userReader.findByUserId("testUser")).thenReturn(Optional.of(user));

        assertThrows(TooManyLoginAttemptsException.class,
            () -> authService.login("testUser", "any"));
    }

    @Test
    @DisplayName("비활성 계정 로그인 시 AccountDisabledException")
    void 비활성계정_로그인_예외() {
        User user = User.builder()
            .id(1L)
            .userId("testUser")
            .password("encoded")
            .active(false)
            .failCount(0)
            .build();
        when(userReader.findByUserId("testUser")).thenReturn(Optional.of(user));

        assertThrows(com.example.atlex.domain.auth.exception.AccountDisabledException.class,
            () -> authService.login("testUser", "any"));
    }

    @Test
    @DisplayName("OAuth2 일회용 코드 교환 성공 시 JWT 토큰을 발급한다")
    void oauth2_코드_교환_성공() {
        User user = activeUser(0);
        when(oAuth2CodeStore.consumeLoginCode("code-123")).thenReturn(1L);
        when(userReader.getActiveUser(1L)).thenReturn(user);
        when(jwtProvider.createAccessToken(1L)).thenReturn("access");
        when(jwtProvider.createRefreshToken(1L)).thenReturn("refresh");
        when(tokenRepository.findById(1L)).thenReturn(Optional.empty());

        TokenResponse response = authService.exchangeOAuth2Code("code-123");

        assertEquals("access", response.getAccessToken());
        assertEquals("refresh", response.getRefreshToken());
        assertEquals("testUser", response.getUserId());
    }

    @Test
    @DisplayName("OAuth2 온보딩 완료 시 사용자·소셜 계정을 생성하고 토큰을 삭제한 뒤 JWT를 발급한다")
    void oauth2_온보딩_성공() {
        OAuth2OnboardingPayload payload = new OAuth2OnboardingPayload(
            SocialProvider.GITHUB, "gh-1", "gh@example.com", "옥토캣");
        OAuth2OnboardingRequest request = new OAuth2OnboardingRequest(
            "onboard-token", "atlexdev", "홍길동", null, true, true, false);
        User created = User.builder()
            .id(10L)
            .userId("atlexdev")
            .email("gh@example.com")
            .name("홍길동")
            .active(true)
            .role(UserRole.USER)
            .build();

        when(oAuth2CodeStore.getOnboardingPayload("onboard-token")).thenReturn(payload);
        when(socialAccountRepository.existsByProviderAndProviderId(SocialProvider.GITHUB, "gh-1")).thenReturn(false);
        when(userReader.createSocialUser("atlexdev", "gh@example.com", "홍길동", true, true, false))
            .thenReturn(created);
        when(jwtProvider.createAccessToken(10L)).thenReturn("access");
        when(jwtProvider.createRefreshToken(10L)).thenReturn("refresh");
        when(tokenRepository.findById(10L)).thenReturn(Optional.empty());

        TokenResponse response = authService.completeOAuth2Onboarding(request);

        assertEquals("atlexdev", response.getUserId());
        verify(socialAccountRepository).save(any(SocialAccount.class));
        verify(oAuth2CodeStore).deleteOnboardingToken("onboard-token");
    }

    @Test
    @DisplayName("관리자 전용 로그인 - ADMIN 계정은 토큰을 발급한다")
    void 관리자_전용_로그인_성공() {
        User admin = User.builder()
            .id(1L)
            .userId("admin")
            .password("encoded")
            .active(true)
            .failCount(0)
            .role(UserRole.ADMIN)
            .build();
        when(userReader.findByUserId("admin")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("correct", "encoded")).thenReturn(true);
        when(jwtProvider.createAccessToken(1L)).thenReturn("access");
        when(jwtProvider.createRefreshToken(1L)).thenReturn("refresh");
        when(tokenRepository.findById(1L)).thenReturn(Optional.empty());

        TokenResponse response = authService.adminLogin("admin", "correct");

        assertEquals(UserRole.ADMIN, response.getRole());
    }

    @Test
    @DisplayName("관리자 전용 로그인 - 일반 USER 계정은 AccessDeniedException을 던진다")
    void 관리자_전용_로그인_일반유저_차단() {
        User normal = activeUser(0);
        when(userReader.findByUserId("testUser")).thenReturn(Optional.of(normal));
        when(passwordEncoder.matches("correct", "encoded")).thenReturn(true);

        assertThrows(AccessDeniedException.class,
            () -> authService.adminLogin("testUser", "correct"));
    }
}

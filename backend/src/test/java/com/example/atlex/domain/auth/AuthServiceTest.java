package com.example.atlex.domain.auth;

import com.example.atlex.domain.auth.dto.response.TokenResponse;
import com.example.atlex.domain.auth.entity.RefreshToken;
import com.example.atlex.domain.auth.exception.AuthenticationException;
import com.example.atlex.domain.auth.exception.TooManyLoginAttemptsException;
import com.example.atlex.domain.auth.repository.RefreshTokenRepository;
import com.example.atlex.domain.auth.service.AuthService;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
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

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtProvider jwtProvider;
    @Mock RefreshTokenRepository tokenRepository;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtProvider, tokenRepository);
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
    @DisplayName("비밀번호 틀리면 DB 레벨에서 원자적 failCount 증가 후 예외")
    void 비밀번호_실패시_failCount_증가_저장() {
        User user = activeUser(0);
        when(userRepository.findByUserId("testUser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        assertThrows(AuthenticationException.class,
                () -> authService.login("testUser", "wrong"));

        verify(userRepository).incrementFailCountAndApplyLock(eq(1L), eq(5), any(LocalDateTime.class), any(LocalDateTime.class));
        verify(userRepository, never()).save(user);
    }

    @Test
    @DisplayName("5회 실패 시 applyLockIfNeeded 호출 후 저장")
    void 다섯번_실패시_계정_잠금() {
        User user = activeUser(4);
        when(userRepository.findByUserId("testUser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        assertThrows(AuthenticationException.class,
                () -> authService.login("testUser", "wrong"));

        verify(userRepository).incrementFailCountAndApplyLock(eq(1L), eq(5), any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("로그인 성공 시 failCount 와 lockedUntil 초기화")
    void 로그인_성공시_실패정보_초기화() {
        User user = activeUser(3);
        when(userRepository.findByUserId("testUser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct", "encoded")).thenReturn(true);
        when(jwtProvider.createAccessToken(1L)).thenReturn("access");
        when(jwtProvider.createRefreshToken(1L)).thenReturn("refresh");
        when(tokenRepository.findById(1L)).thenReturn(Optional.empty());

        authService.login("testUser", "correct");

        assertEquals(0, user.getFailCount());
        assertNull(user.getLockedUntil());
    }

    @Test
    @DisplayName("잠긴 계정 로그인 시 TooManyLoginAttemptsException")
    void 잠긴계정_로그인_예외() {
        User user = activeUser(5);
        user.setLockedUntil(LocalDateTime.now().plusMinutes(10));
        when(userRepository.findByUserId("testUser")).thenReturn(Optional.of(user));

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
        when(userRepository.findByUserId("testUser")).thenReturn(Optional.of(user));

        assertThrows(com.example.atlex.domain.auth.exception.AccountDisabledException.class,
                () -> authService.login("testUser", "any"));
    }
}

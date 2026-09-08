package com.example.atlex.domain.auth.service;

import com.example.atlex.domain.auth.dto.response.TokenResponse;
import com.example.atlex.domain.auth.entity.RefreshToken;
import com.example.atlex.domain.auth.repository.RefreshTokenRepository;
import com.example.atlex.domain.auth.exception.AccountDisabledException;
import com.example.atlex.domain.auth.exception.AccountLockedException;
import com.example.atlex.domain.auth.exception.AuthenticationException;
import com.example.atlex.domain.auth.exception.InvalidTokenException;
import com.example.atlex.domain.auth.exception.TooManyLoginAttemptsException;
import com.example.atlex.domain.user.exception.UserNotFoundException;
import com.example.atlex.global.security.jwt.JwtProvider;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository tokenRepository;

    private static final int MAX_FAIL_COUNT = 5;
    private static final int LOCK_MINUTES = 30;

    // AuthenticationException 은 RuntimeException 이라 기본적으로 롤백됨.
    // 로그인 실패 시 failCount/lockedUntil 저장이 롤백되지 않도록 방지.
    @Transactional(noRollbackFor = AuthenticationException.class)
    public TokenResponse login(String userId, String password) {
        User user = userRepository.findByUserId(userId)
            .orElseThrow(AuthenticationException::new);

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new AccountDisabledException();
        }

        // 잠금 여부 확인
        if (user.isLocked()) {
            throw new TooManyLoginAttemptsException();
        }

        // 비밀번호 검증 — 실패 카운트는 DB 레벨에서 원자적으로 증가
        if (!passwordEncoder.matches(password, user.getPassword())) {
            LocalDateTime now = LocalDateTime.now();
            userRepository.incrementFailCountAndApplyLock(user.getId(), MAX_FAIL_COUNT, now.plusMinutes(LOCK_MINUTES),
                now);
            throw new AuthenticationException();
        }

        // 로그인 성공 시 실패 횟수 초기화 (dirty checking으로 자동 반영)
        user.clearLockState();

        // 토큰 발급
        String accessToken = jwtProvider.createAccessToken(user.getId());
        String refreshToken = jwtProvider.createRefreshToken(user.getId());
        LocalDateTime expiredDate = LocalDateTime.now().plusDays(14);

        // 리프레시 토큰 저장 (기존 토큰 있으면 갱신)
        RefreshToken token = tokenRepository.findById(user.getId())
            .map(t -> {
                t.updateToken(refreshToken, expiredDate);
                return t;
            })
            .orElse(RefreshToken.builder().id(user.getId()).token(refreshToken).expiredDate(expiredDate).build());
        tokenRepository.save(token);

        return TokenResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .userId(userId)
            .build();
    }

    @Transactional
    public TokenResponse reissue(String refreshToken) {
        if (!jwtProvider.validateRefreshToken(refreshToken)) {
            throw new InvalidTokenException("리프레시 토큰이 만료되었습니다.");
        }

        Long userPk = jwtProvider.getUserPk(refreshToken);
        User user = userRepository.findByIdAndActiveTrue(userPk)
            .orElseThrow(UserNotFoundException::new);

        // 잠긴 계정은 토큰 갱신 차단 (403 반환 — 클라이언트가 재로그인 화면으로 유도)
        if (user.isLocked()) {
            throw new AccountLockedException();
        }

        RefreshToken savedToken = tokenRepository.findById(userPk)
            .orElseThrow(() -> new InvalidTokenException("로그인 정보가 없습니다. 다시 로그인 해주세요."));
        if (!savedToken.getToken().equals(refreshToken)) {
            throw new InvalidTokenException("토큰 정보가 일치하지 않습니다.");
        }

        // 만료된 잠금 상태만 초기화 — failCount만 있는 경우는 유지 (잠금 우회 방지)
        if (user.getLockedUntil() != null) {
            user.clearLockState();
        }

        String newAccessToken = jwtProvider.createAccessToken(userPk);
        String newRefreshToken = jwtProvider.createRefreshToken(userPk);
        LocalDateTime expiredDate = LocalDateTime.now().plusDays(14);

        savedToken.updateToken(newRefreshToken, expiredDate);
        tokenRepository.save(savedToken);

        return TokenResponse.builder()
            .accessToken(newAccessToken)
            .refreshToken(newRefreshToken)
            .userId(user.getUserId())
            .build();
    }

    @Transactional
    public void logout(Long id) {
        tokenRepository.deleteById(id);
    }
}

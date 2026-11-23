package com.example.atlex.domain.auth.service;

import com.example.atlex.domain.auth.dto.request.OAuth2OnboardingRequest;
import com.example.atlex.domain.auth.dto.response.OAuth2AvailabilityResponse;
import com.example.atlex.domain.auth.dto.response.TokenResponse;
import com.example.atlex.domain.auth.entity.RefreshToken;
import com.example.atlex.domain.auth.entity.SocialAccount;
import com.example.atlex.domain.auth.oauth2.OAuth2CodeStore;
import com.example.atlex.domain.auth.oauth2.OAuth2OnboardingPayload;
import com.example.atlex.domain.auth.repository.RefreshTokenRepository;
import com.example.atlex.domain.auth.repository.SocialAccountRepository;
import com.example.atlex.domain.auth.exception.AccountDisabledException;
import com.example.atlex.domain.auth.exception.AccountLockedException;
import com.example.atlex.domain.auth.exception.AuthenticationException;
import com.example.atlex.domain.auth.exception.InvalidTokenException;
import com.example.atlex.domain.auth.exception.TooManyLoginAttemptsException;
import com.example.atlex.domain.user.service.UserReader;
import com.example.atlex.global.exception.AccessDeniedException;
import com.example.atlex.global.exception.ValidationException;
import com.example.atlex.global.security.jwt.JwtProvider;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.entity.UserRole;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserReader userReader;
    private final SocialAccountRepository socialAccountRepository;
    private final OAuth2CodeStore oAuth2CodeStore;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository tokenRepository;

    private static final int MAX_FAIL_COUNT = 5;
    private static final int LOCK_MINUTES = 30;

    // AuthenticationException 은 RuntimeException 이라 기본적으로 롤백됨.
    // 로그인 실패 시 failCount/lockedUntil 저장이 롤백되지 않도록 방지.
    @Transactional(noRollbackFor = AuthenticationException.class)
    public TokenResponse login(String userId, String password) {
        User user = authenticateUser(userId, password);
        return issueTokenResponse(user);
    }

    /**
     * 관리자 전용 로그인을 수행합니다. {@link UserRole#ADMIN} 권한이 없으면 403 예외를 반환합니다.
     *
     * @param userId 관리자 아이디
     * @param password 비밀번호
     * @return 발급된 JWT 토큰 응답
     */
    @Transactional(noRollbackFor = AuthenticationException.class)
    public TokenResponse adminLogin(String userId, String password) {
        User user = authenticateUser(userId, password);
        if (user.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("관리자 권한이 필요합니다.");
        }
        return issueTokenResponse(user);
    }

    private User authenticateUser(String userId, String password) {
        User user = userReader.findByUserId(userId)
            .orElseThrow(AuthenticationException::new);

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new AccountDisabledException();
        }

        // 잠금 여부 확인
        if (user.isLocked()) {
            throw new TooManyLoginAttemptsException();
        }

        // 비밀번호 검증 — 실패 카운트는 DB 레벨에서 원자적으로 증가
        if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            LocalDateTime now = LocalDateTime.now();
            userReader.incrementLoginFailure(user.getId(), MAX_FAIL_COUNT, now.plusMinutes(LOCK_MINUTES), now);
            throw new AuthenticationException();
        }

        // 로그인 성공 시 실패 횟수 초기화 (dirty checking으로 자동 반영)
        if (user.getFailCount() > 0 || user.getLockedUntil() != null) {
            user.clearLockState();
        }

        return user;
    }

    @Transactional
    public TokenResponse reissue(String refreshToken) {
        if (!jwtProvider.validateRefreshToken(refreshToken)) {
            throw new InvalidTokenException("리프레시 토큰이 만료되었습니다.");
        }

        Long userPk = jwtProvider.getUserPk(refreshToken);
        User user = userReader.getActiveUser(userPk);

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

        return issueTokenResponse(user);
    }

    /**
     * OAuth2 일회용 인가 코드를 소비하여 JWT 액세스·리프레시 토큰을 발급합니다.
     *
     * @param code OAuth2 콜백으로 전달된 일회용 코드
     * @return 발급된 JWT 토큰 응답
     */
    @Transactional
    public TokenResponse exchangeOAuth2Code(String code) {
        Long userPk = oAuth2CodeStore.consumeLoginCode(code);
        User user = userReader.getActiveUser(userPk);

        if (user.isLocked()) {
            throw new AccountLockedException();
        }
        if (user.getLockedUntil() != null) {
            user.clearLockState();
        }

        return issueTokenResponse(user);
    }

    /**
     * 신규 소셜 사용자의 온보딩(약관 동의·아이디·닉네임)을 완료하고 소셜 계정을 연동한 뒤 JWT 토큰을 발급합니다.
     *
     * @param request 온보딩 요청 정보
     * @return 발급된 JWT 토큰 응답
     */
    @Transactional
    public TokenResponse completeOAuth2Onboarding(OAuth2OnboardingRequest request) {
        OAuth2OnboardingPayload payload = oAuth2CodeStore.getOnboardingPayload(request.getOnboardingToken());

        String resolvedEmail = (payload.email() != null && !payload.email().isBlank())
            ? payload.email().trim()
            : (request.getEmail() != null ? request.getEmail().trim() : null);

        if (resolvedEmail == null || resolvedEmail.isBlank()) {
            throw new ValidationException("이메일을 입력해주세요.");
        }

        if (socialAccountRepository.existsByProviderAndProviderId(payload.provider(), payload.providerId())) {
            throw new AuthenticationException();
        }

        User user = userReader.createSocialUser(
            request.getUserId(),
            resolvedEmail,
            request.getName(),
            Boolean.TRUE.equals(request.getTermsAgreed()),
            Boolean.TRUE.equals(request.getPrivacyAgreed()),
            Boolean.TRUE.equals(request.getMarketingAgreed()));

        socialAccountRepository.save(
            SocialAccount.builder()
                .user(user)
                .provider(payload.provider())
                .providerId(payload.providerId())
                .email(resolvedEmail)
                .build());

        oAuth2CodeStore.deleteOnboardingToken(request.getOnboardingToken());
        return issueTokenResponse(user);
    }

    private TokenResponse issueTokenResponse(User user) {
        String accessToken = jwtProvider.createAccessToken(user.getId());
        String refreshToken = jwtProvider.createRefreshToken(user.getId());
        LocalDateTime expiredDate = LocalDateTime.now().plusDays(14);

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
            .userId(user.getUserId())
            .role(user.getRole())
            .build();
    }

    @Transactional(readOnly = true)
    public OAuth2AvailabilityResponse checkOAuth2Availability(String userId, String name) {
        Boolean userIdAvailable = (userId != null && !userId.isBlank()) ? userReader.isUserIdAvailable(userId) : null;
        Boolean nameAvailable = (name != null && !name.isBlank()) ? userReader.isNameAvailable(name) : null;
        return new OAuth2AvailabilityResponse(userIdAvailable, nameAvailable);
    }

    @Transactional
    public void logout(Long id) {
        tokenRepository.deleteById(id);
    }
}

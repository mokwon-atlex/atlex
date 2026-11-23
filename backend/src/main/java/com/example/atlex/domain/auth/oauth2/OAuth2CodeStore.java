package com.example.atlex.domain.auth.oauth2;

import com.example.atlex.domain.auth.exception.InvalidTokenException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.UUID;

/**
 * OAuth2 일회용 로그인 교환 코드와 신규 사용자 온보딩 토큰을 Redis에 저장·소비합니다.
 */
@Component
@RequiredArgsConstructor
public class OAuth2CodeStore {

    private static final Duration CODE_TTL = Duration.ofMinutes(3);
    private static final String CODE_PREFIX = "oauth2:code:";
    private static final String ONBOARDING_PREFIX = "oauth2:onboarding:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    /**
     * 기존 연동 사용자를 위한 3분 TTL 일회용 교환 코드를 발급합니다.
     *
     * @param userId 내부 사용자 PK
     * @return 일회용 교환 코드
     */
    public String issueLoginCode(Long userId) {
        String code = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(CODE_PREFIX + code, String.valueOf(userId), CODE_TTL);
        return code;
    }

    /**
     * 일회용 교환 코드를 원자적으로 소비하고 사용자 PK를 반환합니다.
     *
     * @param code 일회용 교환 코드
     * @return 내부 사용자 PK
     */
    public Long consumeLoginCode(String code) {
        if (code == null || code.isBlank()) {
            throw new InvalidTokenException("유효하지 않거나 만료된 OAuth2 인증 코드입니다.");
        }
        String value = redisTemplate.opsForValue().getAndDelete(CODE_PREFIX + code.trim());
        if (value == null || value.isBlank()) {
            throw new InvalidTokenException("유효하지 않거나 만료된 OAuth2 인증 코드입니다.");
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            throw new InvalidTokenException("유효하지 않은 OAuth2 인증 코드입니다.");
        }
    }

    /**
     * 신규 소셜 사용자를 위한 3분 TTL 일회용 온보딩 토큰을 발급합니다.
     *
     * @param payload 소셜 제공자 식별 정보 및 기본 프로필
     * @return 온보딩 토큰
     */
    public String issueOnboardingToken(OAuth2OnboardingPayload payload) {
        String token = UUID.randomUUID().toString();
        try {
            String json = objectMapper.writeValueAsString(payload);
            redisTemplate.opsForValue().set(ONBOARDING_PREFIX + token, json, CODE_TTL);
            return token;
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("OAuth2 온보딩 정보 직렬화에 실패했습니다.", e);
        }
    }

    /**
     * 온보딩 토큰에 연결된 소셜 사용자 정보를 조회합니다(가입 성공 전 검증 실패 시 재시도 허용을 위해 유지).
     *
     * @param token 온보딩 토큰
     * @return 소셜 사용자 정보
     */
    public OAuth2OnboardingPayload getOnboardingPayload(String token) {
        if (token == null || token.isBlank()) {
            throw new InvalidTokenException("유효하지 않거나 만료된 온보딩 토큰입니다.");
        }
        String json = redisTemplate.opsForValue().get(ONBOARDING_PREFIX + token.trim());
        if (json == null || json.isBlank()) {
            throw new InvalidTokenException("유효하지 않거나 만료된 온보딩 토큰입니다.");
        }
        try {
            return objectMapper.readValue(json, OAuth2OnboardingPayload.class);
        } catch (JsonProcessingException e) {
            throw new InvalidTokenException("유효하지 않은 온보딩 토큰입니다.");
        }
    }

    /**
     * 온보딩 완료 후 토큰을 즉시 폐기합니다.
     *
     * @param token 온보딩 토큰
     */
    public void deleteOnboardingToken(String token) {
        if (token != null && !token.isBlank()) {
            redisTemplate.delete(ONBOARDING_PREFIX + token.trim());
        }
    }
}

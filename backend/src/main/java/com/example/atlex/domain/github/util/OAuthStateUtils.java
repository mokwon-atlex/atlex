package com.example.atlex.domain.github.util;

import com.example.atlex.domain.github.exception.GitHubOAuthFailedException;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * GitHub OAuth의 CSRF 공격을 방지하기 위한 state 토큰 생성 및 검증 유틸리티입니다.
 */
public final class OAuthStateUtils {

    private static final long STATE_EXPIRATION_MS = 15 * 60 * 1000L; // 15분 유효

    private OAuthStateUtils() {}

    /**
     * 사용자 ID와 현재 시각, 난수를 암호화하여 위변조가 불가능한 state 문자열을 생성합니다.
     */
    public static String generateState(Long userId, String secretKey) {
        String payload = userId + ":" + System.currentTimeMillis() + ":" + UUID.randomUUID();
        String encrypted = AesEncryptionUtils.encrypt(payload, secretKey);
        return URLEncoder.encode(encrypted, StandardCharsets.UTF_8);
    }

    /**
     * 전달받은 state 문자열을 검증하고, 요청자 일치 여부 및 만료 시간을 확인합니다.
     *
     * @throws GitHubOAuthFailedException state가 위조되었거나 만료되었거나 사용자 ID가 다를 경우
     */
    public static void validateState(String encodedState, Long expectedUserId, String secretKey) {
        if (encodedState == null || encodedState.isBlank()) {
            throw new GitHubOAuthFailedException("OAuth state 값이 누락되었습니다.");
        }

        try {
            String encrypted = URLDecoder.decode(encodedState, StandardCharsets.UTF_8);
            String payload;
            try {
                payload = AesEncryptionUtils.decrypt(encrypted, secretKey);
            } catch (Exception e) {
                payload = AesEncryptionUtils.decrypt(encrypted.replace(' ', '+'), secretKey);
            }
            String[] parts = payload.split(":");

            if (parts.length < 3) {
                throw new GitHubOAuthFailedException("유효하지 않은 state 형식입니다.");
            }

            Long stateUserId = Long.parseLong(parts[0]);
            long timestamp = Long.parseLong(parts[1]);

            if (!stateUserId.equals(expectedUserId)) {
                throw new GitHubOAuthFailedException("요청한 사용자와 OAuth state의 소유자가 일치하지 않습니다.");
            }

            if (System.currentTimeMillis() - timestamp > STATE_EXPIRATION_MS) {
                throw new GitHubOAuthFailedException("OAuth state 유효 시간이 만료되었습니다. 다시 시도해 주세요.");
            }
        } catch (GitHubOAuthFailedException e) {
            throw e;
        } catch (Exception e) {
            throw new GitHubOAuthFailedException("OAuth state 검증 중 오류가 발생했습니다: 위변조되었거나 손상된 값입니다.");
        }
    }
}

package com.example.atlex.domain.github.util;

import com.example.atlex.domain.github.exception.GitHubOAuthFailedException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OAuthStateUtilsTest {

    private static final String TEST_KEY = "test-secret-key-32bytes-for-aes!";

    @Test
    @DisplayName("정상적으로 발급된 state 토큰은 검증을 통과한다")
    void generateAndValidateSuccess() {
        Long userId = 12345L;

        String state = OAuthStateUtils.generateState(userId, TEST_KEY);

        assertThat(state).isNotBlank();
        assertThatCode(() -> OAuthStateUtils.validateState(state, userId, TEST_KEY))
            .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("다른 사용자의 ID로 state를 검증하면 예외가 발생한다")
    void validateFailsForDifferentUser() {
        Long originalUserId = 12345L;
        Long attackerUserId = 99999L;

        String state = OAuthStateUtils.generateState(originalUserId, TEST_KEY);

        assertThatThrownBy(() -> OAuthStateUtils.validateState(state, attackerUserId, TEST_KEY))
            .isInstanceOf(GitHubOAuthFailedException.class)
            .hasMessageContaining("일치하지 않습니다");
    }

    @Test
    @DisplayName("변조되거나 잘못된 형식의 state는 예외가 발생한다")
    void validateFailsForTamperedState() {
        assertThatThrownBy(() -> OAuthStateUtils.validateState("tampered-state-token", 12345L, TEST_KEY))
            .isInstanceOf(GitHubOAuthFailedException.class)
            .hasMessageContaining("위변조");
    }

    @Test
    @DisplayName("유효 시간(15분)이 만료된 state는 예외가 발생한다")
    void validateFailsForExpiredState() {
        // given: 16분 전 타임스탬프로 수동 암호화된 state
        long expiredTime = System.currentTimeMillis() - (16 * 60 * 1000L);
        String payload = "12345:" + expiredTime + ":uuid-test";
        String encrypted = AesEncryptionUtils.encrypt(payload, TEST_KEY);

        assertThatThrownBy(() -> OAuthStateUtils.validateState(encrypted, 12345L, TEST_KEY))
            .isInstanceOf(GitHubOAuthFailedException.class)
            .hasMessageContaining("만료");
    }
}

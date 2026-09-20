package com.example.atlex.domain.ai.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.atlex.domain.ai.exception.TooManyAiRequestsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AiRateLimiterTest {

    private AiRateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiter = new AiRateLimiter();
    }

    @Test
    @DisplayName("분당 10회까지는 요청이 정상적으로 통과한다")
    void checkRateLimit_successUpTo10Requests() {
        String key = "user-1";

        assertThatCode(() -> {
            for (int i = 0; i < 10; i++) {
                rateLimiter.checkRateLimit(key);
            }
        }).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("1분 내에 11번째 요청 시 TooManyAiRequestsException이 발생한다")
    void checkRateLimit_exceedLimitThrowsException() {
        String key = "user-1";

        for (int i = 0; i < 10; i++) {
            rateLimiter.checkRateLimit(key);
        }

        assertThatThrownBy(() -> rateLimiter.checkRateLimit(key))
            .isInstanceOf(TooManyAiRequestsException.class);
    }

    @Test
    @DisplayName("서로 다른 사용자의 요청 횟수는 독립적으로 계산된다")
    void checkRateLimit_isolatedBetweenUsers() {
        String userA = "user-A";
        String userB = "user-B";

        for (int i = 0; i < 10; i++) {
            rateLimiter.checkRateLimit(userA);
        }

        // userA는 11번째 실패
        assertThatThrownBy(() -> rateLimiter.checkRateLimit(userA))
            .isInstanceOf(TooManyAiRequestsException.class);

        // userB는 독립적으로 정상 통과
        assertThatCode(() -> {
            for (int i = 0; i < 10; i++) {
                rateLimiter.checkRateLimit(userB);
            }
        }).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("키가 null이거나 공백이면 호출 제한 검사를 건너뛴다")
    void checkRateLimit_nullOrBlankKeyPasses() {
        assertThatCode(() -> {
            for (int i = 0; i < 20; i++) {
                rateLimiter.checkRateLimit(null);
                rateLimiter.checkRateLimit("");
                rateLimiter.checkRateLimit("   ");
            }
        }).doesNotThrowAnyException();
    }
}

package com.example.atlex.domain.post;

import com.example.atlex.domain.post.service.PostHitLimiter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostHitLimiterTest {

    @Mock
    StringRedisTemplate redisTemplate;
    @Mock
    ValueOperations<String, String> valueOperations;

    @InjectMocks
    PostHitLimiter postHitLimiter;

    @Test
    @DisplayName("로그인 사용자의 첫 조회는 24시간 키를 선점하고 true를 반환한다")
    void shouldIncreaseHit_firstLoggedInView_returnsTrue() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent("post:hit:10:u:1", "1", Duration.ofHours(24))).thenReturn(true);

        assertTrue(postHitLimiter.shouldIncreaseHit(10L, 1L, "127.0.0.1"));
        verify(valueOperations).setIfAbsent("post:hit:10:u:1", "1", Duration.ofHours(24));
    }

    @Test
    @DisplayName("이미 조회한 비로그인 IP는 false를 반환한다")
    void shouldIncreaseHit_duplicateIpView_returnsFalse() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent("post:hit:10:ip:10.0.0.1", "1", Duration.ofHours(24))).thenReturn(false);

        assertFalse(postHitLimiter.shouldIncreaseHit(10L, null, "10.0.0.1"));
    }

    @Test
    @DisplayName("Redis 장애 시 fail-open으로 true를 반환한다")
    void shouldIncreaseHit_redisFailure_failOpen() {
        when(redisTemplate.opsForValue()).thenThrow(new RedisConnectionFailureException("down"));

        assertTrue(postHitLimiter.shouldIncreaseHit(10L, 1L, "127.0.0.1"));
    }
}

package com.example.atlex.domain.post.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Redis SETNX 기반으로 동일 사용자·IP의 24시간 내 중복 게시글 조회수 증가를 방지합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PostHitLimiter {

    private static final Duration HIT_COOLDOWN = Duration.ofHours(24);
    private static final String KEY_PREFIX = "post:hit:";

    private final StringRedisTemplate redisTemplate;

    /**
     * 조회수 증가 허용 여부를 확인하고 24시간 TTL 키를 선점합니다.
     *
     * @param postId 게시글 ID
     * @param viewerId 로그인 사용자 PK (비로그인이면 null)
     * @param clientIp 클라이언트 IP (비로그인 식별용, null 가능)
     * @return 조회수를 증가시켜야 하면 true
     */
    public boolean shouldIncreaseHit(Long postId, Long viewerId, String clientIp) {
        String viewerKey = resolveViewerKey(viewerId, clientIp);
        if (viewerKey == null) {
            return true;
        }

        String redisKey = KEY_PREFIX + postId + ":" + viewerKey;
        try {
            Boolean acquired = redisTemplate.opsForValue().setIfAbsent(redisKey, "1", HIT_COOLDOWN);
            return Boolean.TRUE.equals(acquired);
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis 연결 실패로 조회수 중복 체크를 우회합니다. postId={}", postId, e);
            return true;
        } catch (Exception e) {
            log.warn("Redis 조회수 중복 체크 중 예외가 발생해 우회합니다. postId={}", postId, e);
            return true;
        }
    }

    private String resolveViewerKey(Long viewerId, String clientIp) {
        if (viewerId != null) {
            return "u:" + viewerId;
        }
        if (clientIp != null && !clientIp.isBlank()) {
            return "ip:" + clientIp.trim();
        }
        return null;
    }
}

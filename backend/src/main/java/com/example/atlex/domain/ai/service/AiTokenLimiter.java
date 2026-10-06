package com.example.atlex.domain.ai.service;

import com.example.atlex.domain.ai.exception.TooManyAiRequestsException;
import com.example.atlex.domain.user.entity.MembershipTier;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiTokenLimiter {

    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;

    private static final int FREE_TIER_LIMIT = 2500;
    private static final int PREMIUM_TIER_LIMIT = 5000;
    private static final Duration FREE_TIER_TTL = Duration.ofHours(24);
    private static final Duration PREMIUM_TIER_TTL = Duration.ofHours(5);

    public void checkAndConsumeToken(String userIdStr, int requiredTokens) {
        if ("anonymous".equals(userIdStr)) {
            throw new TooManyAiRequestsException();
        }
        User user = userRepository.findByUserId(userIdStr)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Long userId = user.getId();
        MembershipTier tier = user.getMembershipTier();
        int maxTokens = (tier == MembershipTier.PREMIUM) ? PREMIUM_TIER_LIMIT : FREE_TIER_LIMIT;
        Duration ttl = (tier == MembershipTier.PREMIUM) ? PREMIUM_TIER_TTL : FREE_TIER_TTL;

        String redisKey = "ai_usage:" + userId;

        try {
            String currentUsageStr = redisTemplate.opsForValue().get(redisKey);
            int currentUsage = currentUsageStr != null ? Integer.parseInt(currentUsageStr) : 0;

            if (currentUsage + requiredTokens > maxTokens) {
                throw new TooManyAiRequestsException();
            }

            // Increment usage
            Long newUsage = redisTemplate.opsForValue().increment(redisKey, requiredTokens);

            // Set TTL if it's the first usage in the window
            if (newUsage != null && newUsage == requiredTokens) {
                redisTemplate.expire(redisKey, ttl);
            }
        } catch (org.springframework.data.redis.RedisConnectionFailureException e) {
            log.error("Redis 서버 장애 발생! AI 토큰 체크를 우회합니다. 사용자 ID: {}", userId, e);
            // Fail-open: 레디스 장애 시 AI 사용을 막지 않음
        } catch (TooManyAiRequestsException e) {
            throw e; // 토큰 초과 예외는 그대로 던짐
        } catch (Exception e) {
            log.error("Redis 토큰 처리 중 알 수 없는 오류 발생. 토큰 체크를 우회합니다.", e);
        }
    }

    public int getRemainingTokens(String userIdStr) {
        if ("anonymous".equals(userIdStr)) {
            return 0;
        }
        User user = userRepository.findByUserId(userIdStr)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Long userId = user.getId();
        MembershipTier tier = user.getMembershipTier();
        int maxTokens = (tier == MembershipTier.PREMIUM) ? PREMIUM_TIER_LIMIT : FREE_TIER_LIMIT;

        String redisKey = "ai_usage:" + userId;

        try {
            String currentUsageStr = redisTemplate.opsForValue().get(redisKey);
            int currentUsage = currentUsageStr != null ? Integer.parseInt(currentUsageStr) : 0;
            return Math.max(0, maxTokens - currentUsage);
        } catch (org.springframework.data.redis.RedisConnectionFailureException e) {
            log.error("Redis 서버 장애 발생! 임시로 가득 찬 토큰을 반환합니다. 사용자 ID: {}", userId);
            return maxTokens;
        } catch (Exception e) {
            log.error("Redis 조회 중 오류 발생", e);
            return maxTokens;
        }
    }

    public int getMaxTokens(String userIdStr) {
        if ("anonymous".equals(userIdStr)) {
            return 0;
        }
        User user = userRepository.findByUserId(userIdStr)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return (user.getMembershipTier() == MembershipTier.PREMIUM) ? PREMIUM_TIER_LIMIT : FREE_TIER_LIMIT;
    }
}

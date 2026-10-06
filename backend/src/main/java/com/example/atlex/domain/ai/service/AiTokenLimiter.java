package com.example.atlex.domain.ai.service;

import com.example.atlex.domain.ai.exception.TooManyAiRequestsException;
import com.example.atlex.domain.user.entity.MembershipTier;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

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
        String currentUsageStr = redisTemplate.opsForValue().get(redisKey);
        int currentUsage = currentUsageStr != null ? Integer.parseInt(currentUsageStr) : 0;

        return Math.max(0, maxTokens - currentUsage);
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

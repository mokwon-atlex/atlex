package com.example.atlex.domain.ai.service;

import com.example.atlex.domain.ai.exception.TooManyAiRequestsException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * 인메모리 슬라이딩 윈도우 기반의 AI API 호출 빈도 제한기입니다.
 * 분당 최대 허용 횟수를 초과하면 TOO_MANY_AI_REQUESTS 예외를 발생시킵니다.
 */
@Component
public class AiRateLimiter {

    private static final int MAX_REQUESTS_PER_MINUTE = 30;
    private static final long ONE_MINUTE_MILLIS = 60_000L;

    private final Map<String, Deque<Long>> requestHistory = new ConcurrentHashMap<>();

    public void checkRateLimit(String key) {
        if (key == null || key.isBlank()) {
            return;
        }

        long now = System.currentTimeMillis();
        Deque<Long> timestamps = requestHistory.computeIfAbsent(key, k -> new ArrayDeque<>());

        synchronized (timestamps) {
            // 1분 이상 지난 타임스탬프 제거
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() > ONE_MINUTE_MILLIS) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= MAX_REQUESTS_PER_MINUTE) {
                throw new TooManyAiRequestsException();
            }

            timestamps.addLast(now);
        }
    }
}

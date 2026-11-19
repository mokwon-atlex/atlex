package com.example.atlex.domain.notification.service;

import com.example.atlex.domain.notification.dto.response.NotificationResponse;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * 사용자별 알림 SSE(Server-Sent Events) 연결을 관리하고 실시간 이벤트를 전송한다.
 */
@Slf4j
@Service
public class NotificationSseService {

    private static final long DEFAULT_TIMEOUT_MS = 30L * 60L * 1000L;
    private static final long HEARTBEAT_INTERVAL_SECONDS = 25L;

    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();
    private final ScheduledExecutorService heartbeatExecutor = Executors.newSingleThreadScheduledExecutor(runnable -> {
        Thread thread = new Thread(runnable, "notification-sse-heartbeat");
        thread.setDaemon(true);
        return thread;
    });

    @PostConstruct
    void startHeartbeat() {
        heartbeatExecutor.scheduleAtFixedRate(
            this::sendHeartbeat,
            HEARTBEAT_INTERVAL_SECONDS,
            HEARTBEAT_INTERVAL_SECONDS,
            TimeUnit.SECONDS);
    }

    @PreDestroy
    void stopHeartbeat() {
        heartbeatExecutor.shutdownNow();
    }

    /**
     * 사용자의 SSE 구독 연결을 등록하고 초기 연결 확인 이벤트를 전송한다.
     *
     * @param userId 구독자 ID
     * @return 등록된 {@link SseEmitter}
     */
    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT_MS);
        emitters.computeIfAbsent(userId, key -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> {
            removeEmitter(userId, emitter);
            emitter.complete();
        });
        emitter.onError(ex -> removeEmitter(userId, emitter));

        sendToEmitter(userId, emitter, "connect", "connected");
        return emitter;
    }

    /**
     * 특정 사용자에게 새 알림 이벤트를 전송한다.
     *
     * @param userId 수신자 ID
     * @param notification 전송할 알림 응답 DTO
     */
    public void sendNotification(Long userId, NotificationResponse notification) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null || userEmitters.isEmpty()) {
            return;
        }

        for (SseEmitter emitter : userEmitters) {
            sendToEmitter(userId, emitter, "notification", notification);
        }
    }

    private void sendToEmitter(Long userId, SseEmitter emitter, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event()
                .name(eventName)
                .data(data, MediaType.APPLICATION_JSON));
        } catch (IOException | IllegalStateException ex) {
            log.debug("SSE 이벤트 전송 실패로 연결을 정리합니다. userId={}, event={}", userId, eventName, ex);
            removeEmitter(userId, emitter);
        }
    }

    private void sendHeartbeat() {
        for (Map.Entry<Long, List<SseEmitter>> entry : emitters.entrySet()) {
            Long userId = entry.getKey();
            for (SseEmitter emitter : entry.getValue()) {
                try {
                    emitter.send(SseEmitter.event().comment("heartbeat"));
                } catch (IOException | IllegalStateException ex) {
                    removeEmitter(userId, emitter);
                }
            }
        }
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null) {
            return;
        }
        userEmitters.remove(emitter);
        if (userEmitters.isEmpty()) {
            emitters.remove(userId, userEmitters);
        }
    }
}

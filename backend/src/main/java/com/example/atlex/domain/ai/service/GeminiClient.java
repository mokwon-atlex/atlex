package com.example.atlex.domain.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiClient {

    private final RestClient geminiRestClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-3.5-flash-lite}")
    private String model;

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.isBlank()) {
            apiKey = resolveApiKeyFromEnvFiles();
            if (apiKey != null && !apiKey.isBlank()) {
                log.info("Gemini API 키를 .env 파일에서 성공적으로 로드했습니다.");
            }
        }
    }

    /**
     * 프로젝트 루트 또는 backend 디렉터리 내 .env 파일에서 GEMINI_API_KEY를 탐색합니다.
     */
    private String resolveApiKeyFromEnvFiles() {
        Path[] envPaths = {
            Paths.get(".env"),
            Paths.get("..", ".env"),
            Paths.get("backend", ".env"),
            Paths.get("..", "backend", ".env")
        };

        for (Path path : envPaths) {
            try {
                if (Files.isRegularFile(path)) {
                    List<String> lines = Files.readAllLines(path);
                    for (String line : lines) {
                        String trimmed = line.trim();
                        if (trimmed.startsWith("#") || trimmed.isBlank())
                            continue;
                        if (trimmed.startsWith("GEMINI_API_KEY=") || trimmed.startsWith("gemini.api-key=")) {
                            String value = trimmed.substring(trimmed.indexOf('=') + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (!value.isBlank()) {
                                return value;
                            }
                        }
                    }
                }
            } catch (Exception ignored) {
                // 탐색 실패 시 다음 경로 확인
            }
        }
        return "";
    }

    /**
     * Gemini REST API를 호출하여 텍스트 완성을 요청합니다.
     *
     * @param systemPrompt 시스템 지시사항
     * @param userPrompt 사용자 문맥 프롬프트
     * @param maxTokens 최대 생성 토큰 수
     * @return AI 생성 텍스트
     */
    public String generateContent(String systemPrompt, String userPrompt, int maxTokens) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API 키가 설정되지 않아 로컬 모의 제안을 반환합니다. 실제 AI 생성을 위해 GEMINI_API_KEY를 설정해주세요.");
            return getLocalFallback(systemPrompt, userPrompt);
        }

        try {
            String text = callGemini(model, systemPrompt, userPrompt, maxTokens);
            if (text != null && !text.isBlank()) {
                return text;
            }
            return getLocalFallback(systemPrompt, userPrompt);
        } catch (Exception e) {
            log.warn("기본 모델({}) 호출 실패, 보조 모델(gemini-3.6-flash)로 재시도합니다: {}", model, e.getMessage());
            try {
                String fallbackText = callGemini("gemini-3.6-flash", systemPrompt, userPrompt, maxTokens);
                if (fallbackText != null && !fallbackText.isBlank()) {
                    return fallbackText;
                }
            } catch (Exception ex) {
                if (ex instanceof org.springframework.web.client.HttpStatusCodeException hse) {
                    log.error("Gemini API HTTP 오류 [{}]: {}", hse.getStatusCode(), hse.getResponseBodyAsString());
                } else {
                    log.error("Gemini API 호출 중 오류 발생: {}", ex.getMessage(), ex);
                }
            }
            return getLocalFallback(systemPrompt, userPrompt);
        }
    }

    private String callGemini(String targetModel, String systemPrompt, String userPrompt, int maxTokens) {
        Map<String, Object> requestPayload = Map.of(
            "systemInstruction", Map.of(
                "parts", List.of(Map.of("text", systemPrompt))),
            "contents", List.of(
                Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", userPrompt)))),
            "generationConfig", Map.of(
                "temperature", 0.3,
                "maxOutputTokens", maxTokens));

        String responseString = geminiRestClient.post()
            .uri(uriBuilder -> uriBuilder
                .path("/v1beta/models/{model}:generateContent")
                .queryParam("key", apiKey)
                .build(targetModel))
            .contentType(MediaType.APPLICATION_JSON)
            .body(requestPayload)
            .retrieve()
            .body(String.class);

        return extractTextFromResponse(responseString);
    }

    private String extractTextFromResponse(String responseString) {
        try {
            JsonNode root = objectMapper.readTree(responseString);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText("");
                }
            }
        } catch (Exception e) {
            log.error("Gemini 응답 파싱 실패: {}", e.getMessage());
        }
        return "";
    }

    private String getLocalFallback(String systemPrompt, String userPrompt) {
        if (systemPrompt != null && systemPrompt.contains("제목 자동완성")) {
            List<String> titleFallbacks = List.of(
                " 핵심 원리와 실전 구현 가이드",
                " 기초부터 심화까지 완벽 정리",
                " 성능 최적화와 트러블슈팅 사례",
                " 실무 아키텍처 설계 및 베스트 프랙티스",
                " 실전 적용 후기와 장단점 분석");
            int seed = Math
                .abs((userPrompt != null ? userPrompt.hashCode() : 0) + (int)(System.currentTimeMillis() / 2500));
            return titleFallbacks.get(seed % titleFallbacks.size());
        }

        if (systemPrompt != null && systemPrompt.contains("메타 설명")) {
            List<String> descriptionFallbacks = List.of(
                "본문에서 다룬 주요 개념과 실무 적용 사례를 핵심 위주로 알기 쉽게 정리한 글입니다.",
                "실제 구현 과정에서 마주친 트러블슈팅 경험과 성능 개선 노하우를 공유합니다.",
                "기초 개념부터 실전 응용까지 단계별 가이드와 베스트 프랙티스를 제공합니다.");
            int seed = Math
                .abs((userPrompt != null ? userPrompt.hashCode() : 0) + (int)(System.currentTimeMillis() / 2000));
            return descriptionFallbacks.get(seed % descriptionFallbacks.size());
        }

        List<String> paragraphFallbacks = List.of(
            " 기술을 적용함으로써 전반적인 시스템 처리 속도와 사용자 경험을 크게 개선할 수 있었습니다.",
            " 이러한 구조를 도입할 때 주의해야 할 점과 실제 운영 환경에서 발생할 수 있는 예외 상황에 대해 짚어보겠습니다.",
            " 다음 단계로는 비동기 파이프라인과 캐싱 전략을 결합하여 병목 현상을 최소화하는 방법을 살펴보겠습니다.",
            " 실제 부하 테스트를 진행하여 트래픽 급증 시의 응답 지연 시간과 자원 사용량 지표를 측정해 보았습니다.",
            " 이와 같은 패턴을 활용하면 모듈 간 결합도를 낮추고 유지보수성을 비약적으로 향상시킬 수 있습니다.",
            " 마지막으로 실제 프로덕션 배포 시 고려해야 할 모니터링 및 로깅 설정 방안에 대해 정리해 보겠습니다.");
        int seed = Math
            .abs((userPrompt != null ? userPrompt.hashCode() : 0) + (int)(System.currentTimeMillis() / 1500));
        return paragraphFallbacks.get(seed % paragraphFallbacks.size());
    }
}

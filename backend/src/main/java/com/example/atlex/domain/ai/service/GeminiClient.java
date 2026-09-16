package com.example.atlex.domain.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    @Value("${gemini.model:gemini-1.5-flash}")
    private String model;

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
            log.warn("Gemini API 키가 설정되지 않았습니다. gemini.api-key 설정을 확인해주세요.");
            return "";
        }

        try {
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
                    .build(model))
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestPayload)
                .retrieve()
                .body(String.class);

            return extractTextFromResponse(responseString);
        } catch (Exception e) {
            log.error("Gemini API 호출 중 오류 발생: {}", e.getMessage(), e);
            return "";
        }
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
}

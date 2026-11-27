package com.example.atlex.domain.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.example.atlex.domain.ai.exception.TooManyAiRequestsException;
import com.example.atlex.domain.ai.service.GeminiClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

class GeminiClientTest {

    @Test
    @DisplayName("API 키가 설정되지 않은 개발 환경에서는 로컬 모의 제안을 반환한다")
    void returnsLocalFallbackWhenApiKeyIsBlank() {
        RestClient restClient = mock(RestClient.class);
        GeminiClient geminiClient = new GeminiClient(restClient, new ObjectMapper());
        ReflectionTestUtils.setField(geminiClient, "apiKey", "");
        ReflectionTestUtils.setField(geminiClient, "model", "gemini-3.5-flash-lite");

        String result = geminiClient.generateContent("제목 자동완성 어시스턴트", "스프링 부트", 60);

        assertThat(result).isNotBlank();
    }

    @Test
    @DisplayName("API 키가 설정된 상태에서 Gemini API가 429(토큰 소진)를 반환하면 모의 데이터 대신 TooManyAiRequestsException을 던진다")
    void throwsTooManyAiRequestsWhenGeminiQuotaExhausted() {
        RestClient restClient = mock(RestClient.class);
        RestClient.RequestBodyUriSpec uriSpec = mock(RestClient.RequestBodyUriSpec.class);
        RestClient.RequestBodySpec bodySpec = mock(RestClient.RequestBodySpec.class);
        RestClient.ResponseSpec responseSpec = mock(RestClient.ResponseSpec.class);

        when(restClient.post()).thenReturn(uriSpec);
        when(uriSpec.uri(anyString(), any(Object[].class))).thenReturn(bodySpec);
        when(bodySpec.header(anyString(), any(String[].class))).thenReturn(bodySpec);
        when(bodySpec.contentType(any())).thenReturn(bodySpec);
        when(bodySpec.body(any(Object.class))).thenReturn(bodySpec);
        when(bodySpec.retrieve()).thenReturn(responseSpec);
        byte[] body = "{\"error\":{\"status\":\"RESOURCE_EXHAUSTED\"}}".getBytes(StandardCharsets.UTF_8);
        HttpClientErrorException quotaException = HttpClientErrorException.create(
            HttpStatus.TOO_MANY_REQUESTS,
            "Too Many Requests",
            HttpHeaders.EMPTY,
            body,
            StandardCharsets.UTF_8);
        when(responseSpec.body(String.class)).thenThrow(quotaException);

        GeminiClient geminiClient = new GeminiClient(restClient, new ObjectMapper());
        ReflectionTestUtils.setField(geminiClient, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(geminiClient, "model", "gemini-3.5-flash-lite");

        assertThatThrownBy(() -> geminiClient.generateContent("본문 작성 코파일럿", "테스트 문맥", 200))
            .isInstanceOf(TooManyAiRequestsException.class);
    }
}

package com.example.atlex.domain.ai;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.atlex.domain.ai.controller.AiSuggestionController;
import com.example.atlex.domain.ai.dto.request.ParagraphSuggestionRequest;
import com.example.atlex.domain.ai.dto.request.TitleSuggestionRequest;
import com.example.atlex.domain.ai.dto.response.AiSuggestionResponse;
import com.example.atlex.domain.ai.service.AiSuggestionService;
import com.example.atlex.global.exception.common.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class AiSuggestionControllerTest {

    @Mock
    private AiSuggestionService aiSuggestionService;

    @InjectMocks
    private AiSuggestionController aiSuggestionController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
            .standaloneSetup(aiSuggestionController)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    }

    @Test
    @DisplayName("POST /api/v1/ai/suggest/title - 유효한 제목으로 요청 시 200 OK와 추천 텍스트를 반환한다")
    void suggestTitleSuccess() throws Exception {
        // given
        TitleSuggestionRequest request = new TitleSuggestionRequest("스프링 부트로", "기술", List.of("AI"));
        AiSuggestionResponse response = AiSuggestionResponse.builder()
            .suggestion(" 블로그 서비스 만들기")
            .build();

        when(aiSuggestionService.suggestTitle(any(TitleSuggestionRequest.class)))
            .thenReturn(response);

        // when & then
        mockMvc.perform(post("/api/v1/ai/suggest/title")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.data.suggestion").value(" 블로그 서비스 만들기"));
    }

    @Test
    @DisplayName("POST /api/v1/ai/suggest/title - 제목이 비어있으면 400 Bad Request를 반환한다")
    void suggestTitleValidationError() throws Exception {
        // given (currentTitle이 공백)
        TitleSuggestionRequest request = new TitleSuggestionRequest("   ", "기술", List.of("AI"));

        // when & then
        mockMvc.perform(post("/api/v1/ai/suggest/title")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/ai/suggest/paragraph - 유효한 본문 요청 시 200 OK와 단락 추천을 반환한다")
    void suggestParagraphSuccess() throws Exception {
        // given
        ParagraphSuggestionRequest request = new ParagraphSuggestionRequest(
            "블로그 만들기",
            "기술",
            List.of("Spring"),
            "의존성 설정을 완료했습니다.");
        AiSuggestionResponse response = AiSuggestionResponse.builder()
            .suggestion("다음으로 서비스 계층을 구현합니다.")
            .build();

        when(aiSuggestionService.suggestParagraph(any(ParagraphSuggestionRequest.class)))
            .thenReturn(response);

        // when & then
        mockMvc.perform(post("/api/v1/ai/suggest/paragraph")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.data.suggestion").value("다음으로 서비스 계층을 구현합니다."));
    }
}

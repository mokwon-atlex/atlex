package com.example.atlex.domain.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.example.atlex.domain.ai.dto.request.ParagraphSuggestionRequest;
import com.example.atlex.domain.ai.dto.request.TitleSuggestionRequest;
import com.example.atlex.domain.ai.dto.response.AiSuggestionResponse;
import com.example.atlex.domain.ai.service.AiSuggestionService;
import com.example.atlex.domain.ai.service.GeminiClient;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import com.example.atlex.domain.ai.service.AiRateLimiter;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AiSuggestionServiceTest {

    @Mock
    private GeminiClient geminiClient;

    @Mock
    private AiRateLimiter aiRateLimiter;

    private AiSuggestionService aiSuggestionService;

    @BeforeEach
    void setUp() {
        aiSuggestionService = new AiSuggestionService(geminiClient, aiRateLimiter);
    }

    @Nested
    @DisplayName("제목 자동완성 제안 (suggestTitle)")
    class SuggestTitleTest {

        @Test
        @DisplayName("현재 제목이 2자 미만이면 Gemini를 호출하지 않고 빈 응답을 반환한다")
        void returnsEmptyWhenTitleTooShort() {
            // given
            TitleSuggestionRequest request = new TitleSuggestionRequest("스", "개발", List.of("Spring"));

            // when
            AiSuggestionResponse response = aiSuggestionService.suggestTitle(request);

            // then
            assertThat(response.getSuggestion()).isEmpty();
            verifyNoInteractions(geminiClient);
        }

        @Test
        @DisplayName("Gemini가 반환한 추천 텍스트에서 불필요한 기호(따옴표, 줄바꿈)를 정제하여 반환한다")
        void cleansQuotesAndNewlinesFromTitleSuggestion() {
            // given
            TitleSuggestionRequest request = new TitleSuggestionRequest("스프링 부트로", "개발", List.of("Spring"));
            when(geminiClient.generateContent(anyString(), anyString(), anyInt()))
                .thenReturn("\" 블로그 만들기\"\n");

            // when
            AiSuggestionResponse response = aiSuggestionService.suggestTitle(request);

            // then
            assertThat(response.getSuggestion()).isEqualTo("블로그 만들기");
        }

        @Test
        @DisplayName("Gemini 응답에 이미 입력된 제목이 중복 포함되어 있으면 접두사를 제거한다")
        void removesDuplicatePrefixMatchingCurrentTitle() {
            // given
            TitleSuggestionRequest request = new TitleSuggestionRequest("스프링 부트로", "개발", null);
            when(geminiClient.generateContent(anyString(), anyString(), anyInt()))
                .thenReturn("스프링 부트로 블로그 만들기 완벽 가이드");

            // when
            AiSuggestionResponse response = aiSuggestionService.suggestTitle(request);

            // then
            assertThat(response.getSuggestion()).isEqualTo("블로그 만들기 완벽 가이드");
        }

        @Test
        @DisplayName("카테고리와 태그가 프롬프트에 정상 포함되어 Gemini에 전달된다")
        void includesCategoryAndTagsInPrompt() {
            // given
            TitleSuggestionRequest request = new TitleSuggestionRequest("스프링 부트", "기술/개발", List.of("AI", "Java"));
            when(geminiClient.generateContent(anyString(), anyString(), anyInt()))
                .thenReturn(" 튜토리얼");

            // when
            aiSuggestionService.suggestTitle(request);

            // then
            ArgumentCaptor<String> userPromptCaptor = ArgumentCaptor.forClass(String.class);
            verify(geminiClient).generateContent(anyString(), userPromptCaptor.capture(), anyInt());

            String sentPrompt = userPromptCaptor.getValue();
            assertThat(sentPrompt).contains("스프링 부트");
            assertThat(sentPrompt).contains("기술/개발");
            assertThat(sentPrompt).contains("AI, Java");
        }
    }

    @Nested
    @DisplayName("본문 단락 제안 (suggestParagraph)")
    class SuggestParagraphTest {

        @Test
        @DisplayName("제목, 카테고리, 태그 및 최근 작성 문맥을 기반으로 단락 추천을 반환한다")
        void returnsParagraphSuggestionSuccessfully() {
            // given
            ParagraphSuggestionRequest request = new ParagraphSuggestionRequest(
                "AI 연동 가이드",
                "기술",
                List.of("Gemini"),
                "의존성을 추가한 뒤 클라이언트를 빈으로 등록했습니다.");
            when(geminiClient.generateContent(anyString(), anyString(), anyInt()))
                .thenReturn("이어서 API 엔드포인트를 호출하는 컨트롤러를 작성합니다.");

            // when
            AiSuggestionResponse response = aiSuggestionService.suggestParagraph(request);

            // then
            assertThat(response.getSuggestion()).isEqualTo("이어서 API 엔드포인트를 호출하는 컨트롤러를 작성합니다.");

            ArgumentCaptor<String> promptCaptor = ArgumentCaptor.forClass(String.class);
            verify(geminiClient).generateContent(anyString(), promptCaptor.capture(), anyInt());
            String sentPrompt = promptCaptor.getValue();
            assertThat(sentPrompt).contains("AI 연동 가이드");
            assertThat(sentPrompt).contains("기술");
            assertThat(sentPrompt).contains("Gemini");
            assertThat(sentPrompt).contains("의존성을 추가한 뒤 클라이언트를 빈으로 등록했습니다.");
        }

        @Test
        @DisplayName("Gemini 응답의 앞뒤 백틱이나 따옴표를 정제한다")
        void cleansBackticksAndQuotesInParagraph() {
            // given
            ParagraphSuggestionRequest request = new ParagraphSuggestionRequest(null, null, null, "문맥");
            when(geminiClient.generateContent(anyString(), anyString(), anyInt()))
                .thenReturn("```다음 단락 내용입니다.```");

            // when
            AiSuggestionResponse response = aiSuggestionService.suggestParagraph(request);

            // then
            assertThat(response.getSuggestion()).isEqualTo("다음 단락 내용입니다.");
        }
    }

    @Nested
    @DisplayName("제목 자동완성 공백 정규화 중복 제거")
    class WhitespaceTitleDeduplicationTest {

        @Test
        @DisplayName("입력 제목과 추천 텍스트 간 공백이 달라도 앞부분 중복을 정상 제거한다")
        void removesDuplicatePrefixEvenWithDifferentWhitespace() {
            // given: 사용자는 "스프링 부트로", AI는 "스프링부트로 블로그 만들기"
            TitleSuggestionRequest request = new TitleSuggestionRequest("스프링 부트로", "개발", null);
            when(geminiClient.generateContent(anyString(), anyString(), anyInt()))
                .thenReturn("스프링부트로 블로그 만들기");

            // when
            AiSuggestionResponse response = aiSuggestionService.suggestTitle(request);

            // then
            assertThat(response.getSuggestion()).isEqualTo("블로그 만들기");
        }
    }

    @Nested
    @DisplayName("게시글 요약 제안 (suggestDescription)")
    class SuggestDescriptionTest {

        @Test
        @DisplayName("본문 내용을 바탕으로 1~2문장의 요약 추천을 생성한다")
        void returnsDescriptionSuggestionSuccessfully() {
            // given
            com.example.atlex.domain.ai.dto.request.DescriptionSuggestionRequest request = new com.example.atlex.domain.ai.dto.request.DescriptionSuggestionRequest(
                "Spring AI 가이드",
                "스프링 부트와 제미나이를 연동하여 블로그 자동완성을 구축하는 튜토리얼입니다.");
            when(geminiClient.generateContent(anyString(), anyString(), anyInt()))
                .thenReturn("Spring Boot와 Gemini를 연동하여 블로그 AI 코파일럿을 구축하는 전 과정을 정리했습니다.");

            // when
            AiSuggestionResponse response = aiSuggestionService.suggestDescription(request);

            // then
            assertThat(response.getSuggestion())
                .isEqualTo("Spring Boot와 Gemini를 연동하여 블로그 AI 코파일럿을 구축하는 전 과정을 정리했습니다.");
        }
    }
}

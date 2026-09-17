package com.example.atlex.domain.ai.service;

import com.example.atlex.domain.ai.dto.request.ParagraphSuggestionRequest;
import com.example.atlex.domain.ai.dto.request.TitleSuggestionRequest;
import com.example.atlex.domain.ai.dto.response.AiSuggestionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiSuggestionService {

    private final GeminiClient geminiClient;

    private static final String TITLE_SYSTEM_PROMPT = """
        당신은 블로그 글 제목 자동완성 어시스턴트입니다.
        사용자가 입력 중인 블로그 글 제목의 뒤에 바로 이어질 자연스럽고 매력적인 텍스트를 제안하세요.

        [규칙]
        1. 사용자가 이미 입력한 앞부분 텍스트는 절대 반복하지 마세요.
        2. 바로 이어 붙일 수 있는 짧은 구절(1~5단어 내외)만 출력하세요.
        3. 따옴표, 마크다운 기호, 줄바꿈, 인사말 등 불필요한 설명은 일절 포함하지 마세요.
        """;

    private static final String PARAGRAPH_SYSTEM_PROMPT = """
        당신은 블로그 글 작성 코파일럿 어시스턴트입니다.
        글의 제목과 직전 작성 문맥을 고려하여, 다음에 올 자연스러운 1개의 단락을 제안하세요.

        [규칙]
        1. 직전 작성 내용을 그대로 반복하지 마세요.
        2. 2~3문장 정도의 자연스럽고 간결한 1개 단락 텍스트만 출력하세요.
        3. 마크다운 헤더(#), 별표(*), 불릿(-), 따옴표, 괄호 해설, 인사말을 절대 포함하지 마세요.
        4. 반드시 자연스러운 한국어로만 작성하고, 불필요한 영어 번역이나 영문 단어를 섞지 마세요.
        5. 직전 문장 뒤에 바로 이어 붙일 수 있는 순수 본문 텍스트만 출력하세요.
        """;

    /**
     * 게시글 제목 자동완성 텍스트를 제안합니다.
     */
    public AiSuggestionResponse suggestTitle(TitleSuggestionRequest request) {
        String currentTitle = request.getCurrentTitle() != null ? request.getCurrentTitle().trim() : "";
        if (currentTitle.length() < 2) {
            return AiSuggestionResponse.builder().suggestion("").build();
        }

        StringBuilder userPrompt = new StringBuilder();
        userPrompt.append("현재 입력된 제목: ").append(currentTitle).append("\n");
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            userPrompt.append("카테고리: ").append(request.getCategory()).append("\n");
        }
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            userPrompt.append("태그: ").append(String.join(", ", request.getTags())).append("\n");
        }

        String rawSuggestion = geminiClient.generateContent(TITLE_SYSTEM_PROMPT, userPrompt.toString(), 60);
        String cleaned = cleanTitleSuggestion(rawSuggestion, currentTitle);

        return AiSuggestionResponse.builder()
            .suggestion(cleaned)
            .build();
    }

    /**
     * 게시글 본문 다음 단락을 제안합니다.
     */
    public AiSuggestionResponse suggestParagraph(ParagraphSuggestionRequest request) {
        StringBuilder userPrompt = new StringBuilder();
        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            userPrompt.append("글 제목: ").append(request.getTitle()).append("\n");
        }
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            userPrompt.append("카테고리: ").append(request.getCategory()).append("\n");
        }
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            userPrompt.append("태그: ").append(String.join(", ", request.getTags())).append("\n");
        }
        if (request.getCurrentWriting() != null && !request.getCurrentWriting().isBlank()) {
            userPrompt.append("직전 작성 내용: ").append(request.getCurrentWriting().trim()).append("\n");
        }
        if (userPrompt.isEmpty()) {
            userPrompt.append("새로운 블로그 글의 흥미로운 도입부 첫 단락을 작성해 주세요.\n");
        }

        String rawSuggestion = geminiClient.generateContent(PARAGRAPH_SYSTEM_PROMPT, userPrompt.toString(), 300);
        String cleaned = cleanParagraphSuggestion(rawSuggestion);

        return AiSuggestionResponse.builder()
            .suggestion(cleaned)
            .build();
    }

    private String cleanTitleSuggestion(String suggestion, String currentTitle) {
        if (suggestion == null) {
            return "";
        }
        String cleaned = suggestion.replaceAll("[\"'\n\r`]", "").trim();
        if (cleaned.startsWith(currentTitle)) {
            cleaned = cleaned.substring(currentTitle.length()).trim();
        }
        return cleaned;
    }

    private String cleanParagraphSuggestion(String suggestion) {
        if (suggestion == null) {
            return "";
        }
        return suggestion.trim()
            .replaceAll("^[`\"'*#\\-]+|[`\"'*#\\-]+$", "")
            .trim();
    }
}

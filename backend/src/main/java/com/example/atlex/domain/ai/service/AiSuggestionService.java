package com.example.atlex.domain.ai.service;

import com.example.atlex.domain.ai.dto.request.DescriptionSuggestionRequest;
import com.example.atlex.domain.ai.dto.request.ParagraphSuggestionRequest;
import com.example.atlex.domain.ai.dto.request.TitleSuggestionRequest;
import com.example.atlex.domain.ai.dto.response.AiSuggestionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiSuggestionService {

    private final GeminiClient geminiClient;
    private final AiRateLimiter aiRateLimiter;

    private static final String TITLE_SYSTEM_PROMPT = """
        당신은 블로그 글 제목 자동완성 어시스턴트입니다.
        사용자가 입력 중인 블로그 글 제목의 뒤에 바로 이어질 자연스럽고 매력적인 텍스트를 제안하세요.

        [규칙]
        1. 사용자가 이미 입력한 앞부분 텍스트는 절대 반복하지 마세요.
        2. 바로 이어 붙일 수 있는 짧은 구절(1~5단어 내외)만 출력하세요.
        3. 따옴표, 마크다운 기호, 줄바꿈, 인사말 등 불필요한 설명은 일절 포함하지 마세요.
        """;

    private static final String PARAGRAPH_SYSTEM_PROMPT = """
        당신은 블로그 글 작성을 돕는 인공지능 코파일럿 어시스턴트입니다.
        글의 제목과 직전 작성 문맥(마지막 문장 및 단어)을 면밀히 분석하여, 바로 뒤에 이어질 자연스럽고 완성도 높은 1개의 문장을 제안하세요.

        [작성 규칙]
        1. 직전 내용과의 연속성:
           - 직전 작성 내용이 마침표나 줄바꿈 없이 단어, 명사구, 미완성 문장으로 끝나 있다면, 그 단어/구절의 문맥과 조사에 맞추어 해당 문장을 자연스럽게 마무리하세요.
           - 직전 작성 내용이 이미 완성된 문장(마침표, 물음표 등)이나 줄바꿈으로 끝나 있다면, 앞선 문맥을 발전시키는 자연스러운 다음 1개의 문장을 시작하세요.
        2. 분량: 사용자가 부담 없이 읽고 수락할 수 있는 명확하고 간결한 1개의 완성된 문장(마침표로 끝남)만 출력하세요.
        3. 일관된 주제 흐름: 직전 작성 내용의 핵심 주제와 톤앤매너를 유지하고, 뜬금없는 주제 전환을 절대 하지 마세요.
        4. 금지 사항: 직전 작성 내용 중복 반복, 마크다운 기호(#, *, -, `), 따옴표, 괄호 설명, 인사말, 불필요한 영어를 절대 포함하지 마세요.
        5. 바로 본문에 이어 붙여 읽어도 문맥, 띄어쓰기, 조사가 완벽하게 통하는 순수 본문 텍스트만 출력하세요.
        """;

    private static final String DESCRIPTION_SYSTEM_PROMPT = """
        당신은 블로그 글의 검색 및 SNS 공유용 메타 설명(Description)을 작성하는 전문 에디터입니다.
        제공된 글의 제목과 본문을 분석하여, 독자의 흥미를 끌 수 있는 매력적이고 간결한 1~2문장의 핵심 요약문을 작성하세요.

        [작성 규칙]
        1. 분량: 1~2문장 (공백 포함 70자 ~ 130자 내외).
        2. 어조: 정중하고 신뢰감 있는 문체 (~합니다, ~을 정리했습니다 등).
        3. 금지 사항: 마크다운 기호(#, *, -), 따옴표, 제목 반복, 인사말, 해시태그를 절대 포함하지 마세요.
        4. 바로 사용할 수 있는 순수 요약 본문 텍스트만 출력하세요.
        """;

    /**
     * 게시글 제목 자동완성 텍스트를 제안합니다.
     */
    public AiSuggestionResponse suggestTitle(TitleSuggestionRequest request) {
        aiRateLimiter.checkRateLimit(resolveCurrentUserKey());

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
     * 게시글 본문 다음 문장을 제안합니다.
     */
    public AiSuggestionResponse suggestParagraph(ParagraphSuggestionRequest request) {
        aiRateLimiter.checkRateLimit(resolveCurrentUserKey());

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
            userPrompt.append("직전 작성 내용:\n<current_writing>\n")
                .append(request.getCurrentWriting().trim())
                .append("\n</current_writing>\n");
        }
        if (userPrompt.isEmpty()) {
            userPrompt.append("새로운 블로그 글의 흥미로운 도입부 첫 문장을 작성해 주세요.\n");
        }

        String rawSuggestion = geminiClient.generateContent(PARAGRAPH_SYSTEM_PROMPT, userPrompt.toString(), 100);
        String cleaned = cleanParagraphSuggestion(rawSuggestion);

        return AiSuggestionResponse.builder()
            .suggestion(cleaned)
            .build();
    }

    /**
     * 게시글 본문 내용을 바탕으로 메타 요약(Description)을 제안합니다.
     */
    public AiSuggestionResponse suggestDescription(DescriptionSuggestionRequest request) {
        aiRateLimiter.checkRateLimit(resolveCurrentUserKey());

        StringBuilder userPrompt = new StringBuilder();
        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            userPrompt.append("글 제목: ").append(request.getTitle()).append("\n");
        }
        userPrompt.append("게시글 본문:\n<content>\n")
            .append(request.getContent().trim())
            .append("\n</content>\n");

        String rawSuggestion = geminiClient.generateContent(DESCRIPTION_SYSTEM_PROMPT, userPrompt.toString(), 150);
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
            return cleaned.substring(currentTitle.length()).trim();
        }

        // 공백 차이로 인한 중복 검사 (예: "스프링 부트로" vs "스프링부트로")
        String normalizedTitle = currentTitle.replaceAll("\\s+", "");
        String normalizedCleaned = cleaned.replaceAll("\\s+", "");
        if (!normalizedTitle.isEmpty() && normalizedCleaned.startsWith(normalizedTitle)) {
            int count = 0;
            int cutIndex = 0;
            for (int i = 0; i < cleaned.length(); i++) {
                if (!Character.isWhitespace(cleaned.charAt(i))) {
                    count++;
                }
                if (count == normalizedTitle.length()) {
                    cutIndex = i + 1;
                    break;
                }
            }
            if (cutIndex > 0 && cutIndex <= cleaned.length()) {
                return cleaned.substring(cutIndex).trim();
            }
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

    private String resolveCurrentUserKey() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                return auth.getName();
            }
        } catch (Exception ignored) {}
        return "anonymous";
    }
}

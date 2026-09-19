package com.example.atlex.domain.ai.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "게시글 본문 다음 단락 AI 제안 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ParagraphSuggestionRequest {

    @Schema(description = "게시글 제목 (선택)", example = "Spring Boot 4와 Gemini로 블로그 AI 만들기")
    @Size(max = 200, message = "제목은 200자 이하로 입력해주세요.")
    private String title;

    @Schema(description = "카테고리명 (선택)", example = "기술/개발")
    @Size(max = 100, message = "카테고리명은 100자 이하로 입력해주세요.")
    private String category;

    @Schema(description = "태그 목록 (선택)", example = "[\"SpringBoot\", \"Gemini\"]")
    @Size(max = 10, message = "태그는 최대 10개까지 전달할 수 있습니다.")
    private List<@Size(max = 100, message = "각 태그는 100자 이하로 입력해주세요.") String> tags;

    @Schema(description = "현재 커서 직전의 최근 작성 문맥/단락 (최대 1000자 권장)", example = "먼저 Spring Boot 환경에서 Gemini API를 호출하기 위한 의존성을 설정했습니다.")
    @Size(max = 2000, message = "작성 문맥은 2000자 이하로 전달해주세요.")
    private String currentWriting;
}

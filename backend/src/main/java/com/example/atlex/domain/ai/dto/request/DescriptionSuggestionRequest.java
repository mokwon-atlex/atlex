package com.example.atlex.domain.ai.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "게시글 요약(Description) AI 자동 생성 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DescriptionSuggestionRequest {

    @Schema(description = "게시글 제목 (선택)", example = "Spring Boot 4와 Gemini AI 연동 가이드")
    @Size(max = 200, message = "제목은 200자 이하로 입력해주세요.")
    private String title;

    @Schema(description = "게시글 본문 텍스트", example = "이번 글에서는 스프링 부트 4 환경에서 Gemini API를 연동하여 블로그 AI 코파일럿을 구축하는 전 과정을 살펴봅니다.")
    @NotBlank(message = "요약할 본문 내용을 입력해주세요.")
    @Size(max = 5000, message = "본문은 5000자 이하로 전달해주세요.")
    private String content;
}

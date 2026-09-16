package com.example.atlex.domain.ai.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "게시글 제목 AI 자동완성 제안 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TitleSuggestionRequest {

    @Schema(description = "현재까지 입력된 제목", example = "스프링 부트 4와 AI를")
    @NotBlank(message = "현재 입력된 제목을 입력해주세요.")
    @Size(max = 200, message = "제목은 200자 이하로 입력해주세요.")
    private String currentTitle;

    @Schema(description = "카테고리명 (선택)", example = "기술/개발")
    private String category;

    @Schema(description = "태그 목록 (선택)", example = "[\"SpringBoot\", \"Gemini\"]")
    private List<String> tags;
}

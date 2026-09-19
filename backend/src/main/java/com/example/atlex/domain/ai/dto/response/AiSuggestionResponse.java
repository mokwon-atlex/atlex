package com.example.atlex.domain.ai.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "AI 제안 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiSuggestionResponse {

    @Schema(description = "AI가 제안한 추천 텍스트", example = " 연동하는 가장 쉬운 방법")
    private String suggestion;
}

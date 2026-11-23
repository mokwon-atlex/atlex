package com.example.atlex.domain.ai.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * AI 제안을 실제로 적용/사용했을 때 토큰을 차감하기 위한 요청 DTO입니다.
 */
@Schema(description = "AI 토큰 실제 사용 차감 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AiConsumeRequest {

    @Schema(description = "적용한 AI 제안 유형 (TITLE, PARAGRAPH, DESCRIPTION)", example = "PARAGRAPH")
    @NotNull(message = "AI 제안 유형을 지정해주세요.")
    private AiSuggestionType type;
}

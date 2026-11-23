package com.example.atlex.domain.ai.dto.request;

/**
 * AI 제안 기능별 토큰 차감 단위를 정의합니다.
 */
public enum AiSuggestionType {
    TITLE(50),
    PARAGRAPH(300),
    DESCRIPTION(150);

    private final int cost;

    AiSuggestionType(int cost) {
        this.cost = cost;
    }

    public int getCost() {
        return cost;
    }
}

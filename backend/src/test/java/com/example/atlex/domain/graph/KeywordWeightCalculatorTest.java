package com.example.atlex.domain.graph;

import com.example.atlex.domain.graph.keyword.entity.KeywordOccurrence;
import com.example.atlex.domain.graph.keyword.KeywordWeightCalculator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class KeywordWeightCalculatorTest {

    private final KeywordWeightCalculator calculator = new KeywordWeightCalculator();

    @Test
    @DisplayName("제목과 태그에 등장한 키워드는 본문만 등장한 키워드보다 높은 가중치를 받는다")
    void boostsTitleAndTagOccurrences() {
        double titleAndTag = calculator.calculate(
            new KeywordOccurrence("spring", 1, 0, 1),
            20,
            4);
        double contentOnly = calculator.calculate(
            new KeywordOccurrence("spring", 0, 2, 0),
            20,
            4);

        assertTrue(titleAndTag > contentOnly);
    }

    @Test
    @DisplayName("많은 게시글에 등장한 키워드는 낮은 IDF로 계산된다")
    void commonKeywordsHaveLowerWeight() {
        KeywordOccurrence occurrence = new KeywordOccurrence("spring", 1, 2, 0);

        double rare = calculator.calculate(occurrence, 100, 2);
        double common = calculator.calculate(occurrence, 100, 80);

        assertTrue(rare > common);
    }
}

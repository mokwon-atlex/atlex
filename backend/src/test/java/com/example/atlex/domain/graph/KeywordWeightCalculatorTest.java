package com.example.atlex.domain.graph;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.example.atlex.domain.graph.config.GraphProperties;
import com.example.atlex.domain.graph.keyword.KeywordWeightCalculator;
import com.example.atlex.domain.graph.keyword.entity.KeywordOccurrence;

class KeywordWeightCalculatorTest {

    private final KeywordWeightCalculator calculator = new KeywordWeightCalculator(defaultGraphProperties());

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
    @DisplayName("태그에 등장한 키워드는 제목에만 등장한 키워드보다 높은 가중치를 받는다")
    void weighsTagAboveTitle() {
        double tagOnly = calculator.calculate(
            new KeywordOccurrence("spring", 0, 0, 1),
            20,
            4);
        double titleOnly = calculator.calculate(
            new KeywordOccurrence("spring", 1, 0, 0),
            20,
            4);

        assertTrue(tagOnly > titleOnly);
    }

    @Test
    @DisplayName("많은 게시글에 등장한 키워드는 낮은 IDF로 계산된다")
    void commonKeywordsHaveLowerWeight() {
        KeywordOccurrence occurrence = new KeywordOccurrence("spring", 1, 2, 0);

        double rare = calculator.calculate(occurrence, 100, 2);
        double common = calculator.calculate(occurrence, 100, 80);

        assertTrue(rare > common);
    }

    @Test
    @DisplayName("설정한 필드 가중치가 계산에 그대로 반영된다")
    void appliesConfiguredFieldWeights() {
        KeywordWeightCalculator configured = new KeywordWeightCalculator(
            new GraphProperties(3.0, 1.0, 2.0, 8, 50, 5, 0.15));
        // documentFrequency 를 totalPosts 와 맞추면 idf 가 1.0 이라 가중치만 남는다.
        double titleOnce = configured.calculate(new KeywordOccurrence("spring", 1, 0, 0), 1, 1);

        assertEquals(3.0, titleOnce, 1e-9);
    }

    /** application.yaml 의 기본값과 같은 설정. */
    private static GraphProperties defaultGraphProperties() {
        return new GraphProperties(1.5, 1.0, 2.0, 8, 50, 5, 0.15);
    }
}

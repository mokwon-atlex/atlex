package com.example.atlex.domain.graph;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import com.example.atlex.domain.graph.config.GraphProperties;

class GraphPropertiesTest {

    @ParameterizedTest(name = "{0} = {1}")
    @CsvSource({
        "graph.relation.max-source-keywords, 0",
        "graph.relation.max-source-keywords, -1",
        "graph.relation.max-candidates, 0",
        "graph.relation.max-candidates, -1",
        "graph.relation.max-per-post, 0",
        "graph.relation.max-per-post, -1"})
    @DisplayName("관계 계산 상한 설정이 1 미만이면 생성 시점에 거부한다")
    void rejectsRelationLimitsBelowOne(String property, int invalidValue) {
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> newProperties(property, invalidValue));

        assertTrue(exception.getMessage().contains(property));
    }

    @Test
    @DisplayName("유효한 설정은 그대로 보관한다")
    void keepsValidValues() {
        GraphProperties properties = new GraphProperties(1.5, 1.0, 2.0, 8, 50, 5, 0.15);

        assertEquals(1.5, properties.getTitleWeight(), 1e-9);
        assertEquals(1.0, properties.getContentWeight(), 1e-9);
        assertEquals(2.0, properties.getTagWeight(), 1e-9);
        assertEquals(8, properties.getMaxSourceKeywords());
        assertEquals(50, properties.getMaxCandidates());
        assertEquals(5, properties.getMaxRelationsPerPost());
        assertEquals(0.15, properties.getMinScore(), 1e-9);
    }

    /** 지정한 설정 하나만 잘못된 값으로 바꾼 GraphProperties 를 만든다. */
    private GraphProperties newProperties(String property, int invalidValue) {
        int maxSourceKeywords = "graph.relation.max-source-keywords".equals(property) ? invalidValue : 8;
        int maxCandidates = "graph.relation.max-candidates".equals(property) ? invalidValue : 50;
        int maxRelationsPerPost = "graph.relation.max-per-post".equals(property) ? invalidValue : 5;

        return new GraphProperties(1.5, 1.0, 2.0, maxSourceKeywords, maxCandidates, maxRelationsPerPost, 0.15);
    }
}

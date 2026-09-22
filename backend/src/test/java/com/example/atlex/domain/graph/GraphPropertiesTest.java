package com.example.atlex.domain.graph;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import com.example.atlex.domain.graph.config.GraphProperties;

class GraphPropertiesTest {

    @ParameterizedTest
    @ValueSource(ints = {0, -1})
    @DisplayName("maxCandidates 가 1 미만이면 생성 시점에 거부한다")
    void rejectsMaxCandidatesBelowOne(int maxCandidates) {
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> new GraphProperties(1.5, 1.0, 2.0, 8, maxCandidates, 5, 0.15));

        assertTrue(exception.getMessage().contains("graph.relation.max-candidates"));
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
}

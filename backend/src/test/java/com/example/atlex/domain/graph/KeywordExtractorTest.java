package com.example.atlex.domain.graph;

import com.example.atlex.domain.graph.keyword.KeywordExtractor;
import com.example.atlex.domain.graph.keyword.entity.KeywordOccurrence;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class KeywordExtractorTest {

    private final KeywordExtractor extractor = new KeywordExtractor();

    @Test
    @DisplayName("제목, 본문, 태그에서 정규화된 키워드 등장 횟수를 계산한다")
    void extractsKeywordOccurrences() {
        Map<String, KeywordOccurrence> result = extractor.extract(
            "Spring Boot Graph",
            "Spring boot graph graph and JPA.",
            List.of("#Spring", "JPA"));

        assertEquals(1, result.get("spring").titleCount());
        assertEquals(1, result.get("spring").contentCount());
        assertEquals(1, result.get("spring").tagCount());
        assertEquals(1, result.get("graph").titleCount());
        assertEquals(2, result.get("graph").contentCount());
        assertEquals(0, result.get("graph").tagCount());
        assertEquals(0, result.get("jpa").titleCount());
        assertEquals(1, result.get("jpa").contentCount());
        assertEquals(1, result.get("jpa").tagCount());
    }

    @Test
    @DisplayName("본문 HTML 의 마크업은 키워드에서 제외하고 평문만 계산한다")
    void excludesHtmlMarkupFromContent() {
        Map<String, KeywordOccurrence> result = extractor.extract(
            "Graph",
            "<div class=\"note\"><p>spring boot</p><a href=\"https://example.com\">link</a></div>",
            List.of());

        assertEquals(1, result.get("spring").contentCount());
        assertEquals(1, result.get("boot").contentCount());
        assertFalse(result.containsKey("div"));
        assertFalse(result.containsKey("class"));
        assertFalse(result.containsKey("href"));
    }

    @Test
    @DisplayName("본문 HTML 의 style 내용과 엔티티는 키워드에서 제외한다")
    void excludesStyleContentAndEntities() {
        Map<String, KeywordOccurrence> result = extractor.extract(
            "Graph",
            "<style>.note{color:red}</style><p>spring&nbsp;boot</p>",
            List.of());

        assertEquals(1, result.get("spring").contentCount());
        assertEquals(1, result.get("boot").contentCount());
        assertFalse(result.containsKey("color"));
        assertFalse(result.containsKey("nbsp"));
    }

    @Test
    @DisplayName("한 글자 토큰과 빈 태그는 제외한다")
    void excludesShortAndBlankTokens() {
        Map<String, KeywordOccurrence> result = extractor.extract(
            "A Go",
            "x y go",
            List.of(" ", "#"));

        assertEquals(List.of("go"), result.keySet().stream().toList());
    }
}

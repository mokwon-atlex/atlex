package com.example.atlex.domain.graph.keyword.entity;

public record KeywordOccurrence(
        String keyword,
        int titleCount,
        int contentCount,
        int tagCount
) {
    int totalCount() {
        return titleCount + contentCount + tagCount;
    }
}

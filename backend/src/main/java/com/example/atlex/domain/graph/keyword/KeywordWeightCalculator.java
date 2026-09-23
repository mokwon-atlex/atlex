package com.example.atlex.domain.graph.keyword;

import org.springframework.stereotype.Component;

import com.example.atlex.domain.graph.config.GraphProperties;
import com.example.atlex.domain.graph.keyword.entity.KeywordOccurrence;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class KeywordWeightCalculator {

    private final GraphProperties graphProperties;

    public double calculate(KeywordOccurrence occurrence, long totalPosts, long documentFrequency) {
        double boostedTermFrequency = occurrence.titleCount() * graphProperties.getTitleWeight()
            + occurrence.contentCount() * graphProperties.getContentWeight()
            + occurrence.tagCount() * graphProperties.getTagWeight();
        double idf = Math.log((totalPosts + 1.0) / (documentFrequency + 1.0)) + 1.0;

        return boostedTermFrequency * idf;
    }
}

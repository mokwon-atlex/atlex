package com.example.atlex.domain.graph.keyword;

import com.example.atlex.domain.graph.keyword.entity.KeywordOccurrence;
import org.springframework.stereotype.Component;

@Component
public class KeywordWeightCalculator {

    private static final double TITLE_BOOST = 2.0;
    private static final double CONTENT_BOOST = 1.0;
    private static final double TAG_BOOST = 1.8;

    public double calculate(KeywordOccurrence occurrence, long totalPosts, long documentFrequency) {
        double boostedTermFrequency =
                occurrence.titleCount() * TITLE_BOOST
                        + occurrence.contentCount() * CONTENT_BOOST
                        + occurrence.tagCount() * TAG_BOOST;
        double idf = Math.log((totalPosts + 1.0) / (documentFrequency + 1.0)) + 1.0;
        return boostedTermFrequency * idf;
    }
}

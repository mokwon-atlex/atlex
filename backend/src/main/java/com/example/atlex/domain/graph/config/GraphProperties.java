package com.example.atlex.domain.graph.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.Getter;

/**
 * 그래프 키워드 가중치와 관계 계산 기준값을 환경 설정으로 주입받는다.
 *
 * <p>인덱싱(GraphIndexService)과 조회(GraphService)가 같은 minScore 를 공유해야 기준이 어긋나지 않는다.
 */
@Getter
@Component
public class GraphProperties {

    private final double titleWeight;
    private final double contentWeight;
    private final double tagWeight;
    private final int maxSourceKeywords;
    private final int maxCandidates;
    private final int maxRelationsPerPost;
    private final double minScore;

    public GraphProperties(
        @Value("${graph.weight.title:1.5}")
        double titleWeight,
        @Value("${graph.weight.content:1.0}")
        double contentWeight,
        @Value("${graph.weight.tag:2.0}")
        double tagWeight,
        @Value("${graph.relation.max-source-keywords:8}")
        int maxSourceKeywords,
        @Value("${graph.relation.max-candidates:50}")
        int maxCandidates,
        @Value("${graph.relation.max-per-post:5}")
        int maxRelationsPerPost,
        @Value("${graph.relation.min-score:0.15}")
        double minScore) {
        // 세 값 모두 1 미만이면 관계 갱신이 실패하거나 조용히 아무 관계도 만들지 않는다.
        // 설정 오류는 요청 시점이 아니라 애플리케이션 시작 시점에 드러나야 한다.
        requireAtLeastOne(maxSourceKeywords, "graph.relation.max-source-keywords");
        requireAtLeastOne(maxCandidates, "graph.relation.max-candidates");
        requireAtLeastOne(maxRelationsPerPost, "graph.relation.max-per-post");

        this.titleWeight = titleWeight;
        this.contentWeight = contentWeight;
        this.tagWeight = tagWeight;
        this.maxSourceKeywords = maxSourceKeywords;
        this.maxCandidates = maxCandidates;
        this.maxRelationsPerPost = maxRelationsPerPost;
        this.minScore = minScore;
    }

    private static void requireAtLeastOne(int value, String property) {
        if (value < 1) {
            throw new IllegalArgumentException(property + " 는 1 이상이어야 합니다.");
        }
    }
}

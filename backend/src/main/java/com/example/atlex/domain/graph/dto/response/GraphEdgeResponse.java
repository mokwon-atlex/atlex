package com.example.atlex.domain.graph.dto.response;

import com.example.atlex.domain.graph.entity.PostRelation;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Arrays;
import java.util.List;

@Schema(description = "그래프 엣지")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphEdgeResponse {

    @Schema(description = "출발 게시글 ID", example = "1")
    private Long sourcePostId;
    @Schema(description = "도착 게시글 ID", example = "3")
    private Long targetPostId;
    @Schema(description = "관계 점수", example = "0.72")
    private Double score;
    @Schema(description = "공유 키워드")
    private List<String> sharedKeywords;

    public static GraphEdgeResponse from(PostRelation relation) {
        List<String> keywords = relation.getSharedKeywords().isBlank()
                ? List.of()
                : Arrays.stream(relation.getSharedKeywords().split(",")).toList();
        return GraphEdgeResponse.builder()
                .sourcePostId(relation.getSourcePost().getId())
                .targetPostId(relation.getTargetPost().getId())
                .score(relation.getScore())
                .sharedKeywords(keywords)
                .build();
    }
}

package com.example.atlex.domain.graph.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Schema(description = "게시글 그래프 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostGraphResponse {

    private List<GraphNodeResponse> nodes;
    private List<GraphEdgeResponse> edges;
}

package com.example.atlex.domain.graph.controller;

import com.example.atlex.domain.graph.dto.response.PostGraphResponse;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Graph", description = "게시글 그래프 API")
public interface PostGraphControllerDocs {

    @Operation(
            summary = "게시글 그래프 조회",
            description = "그래프 뷰에서 사용할 게시글 노드와 관계 엣지를 조회합니다. 비로그인은 공개 글만, 로그인 사용자는 공개 글과 본인 비공개 글을 노드로 조회합니다."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    })
    ResponseEntity<ApiResponse<PostGraphResponse>> getGraph(
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalDetails principalDetails,
            @Parameter(description = "작성자 아이디 필터", example = "john123")
            @RequestParam(required = false) String userId,
            @Parameter(description = "카테고리 ID 필터", example = "2")
            @RequestParam(required = false) Long categoryId,
            @Parameter(description = "최소 관계 점수", example = "0.15")
            @RequestParam(required = false) Double minScore
    );

    @Operation(
            summary = "게시글 중심 그래프 조회",
            description = "특정 게시글을 중심으로 직접 연결된 1-hop 게시글 노드와 관계 엣지를 조회합니다."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "게시글 없음")
    })
    ResponseEntity<ApiResponse<PostGraphResponse>> getPostGraph(
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalDetails principalDetails,
            @Parameter(description = "중심 게시글 ID", example = "17")
            @PathVariable Long postId,
            @Parameter(description = "최소 관계 점수", example = "0.15")
            @RequestParam(required = false) Double minScore,
            @Parameter(description = "최대 관계 개수", example = "10")
            @RequestParam(required = false) Integer limit
    );
}

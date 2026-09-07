package com.example.atlex.domain.graph.controller;

import com.example.atlex.domain.graph.dto.response.PostGraphResponse;
import com.example.atlex.domain.graph.service.GraphService;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/graph")
@RequiredArgsConstructor
public class PostGraphController implements PostGraphControllerDocs {

    private final GraphService graphService;

    @GetMapping
    public ResponseEntity<ApiResponse<PostGraphResponse>> getGraph(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double minScore
    ) {
        Long viewerId = principalDetails != null ? principalDetails.user().getId() : null;
        PostGraphResponse response = graphService.getGraph(userId, categoryId, minScore, viewerId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<ApiResponse<PostGraphResponse>> getPostGraph(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @PathVariable Long postId,
            @RequestParam(required = false) Double minScore,
            @RequestParam(required = false) Integer limit
    ) {
        Long viewerId = principalDetails != null ? principalDetails.user().getId() : null;
        PostGraphResponse response = graphService.getPostGraph(postId, minScore, limit, viewerId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

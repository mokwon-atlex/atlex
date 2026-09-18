package com.example.atlex.domain.ai.controller;

import com.example.atlex.domain.ai.dto.request.ParagraphSuggestionRequest;
import com.example.atlex.domain.ai.dto.request.TitleSuggestionRequest;
import com.example.atlex.domain.ai.dto.response.AiSuggestionResponse;
import com.example.atlex.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

@Tag(name = "AI 제안 (AI Suggestions)", description = "게시글 작성 보조 AI 자동완성 및 제안 API")
public interface AiSuggestionControllerDocs {

    @Operation(summary = "게시글 제목 AI 자동완성 추천", description = "현재 입력 중인 제목 및 메타데이터를 기반으로 이어질 제목 텍스트를 제안합니다.")
    ResponseEntity<ApiResponse<AiSuggestionResponse>> suggestTitle(TitleSuggestionRequest request);

    @Operation(summary = "게시글 본문 다음 단락 AI 추천", description = "게시글 제목, 태그, 직전 작성 문맥을 기반으로 다음 단락을 제안합니다.")
    ResponseEntity<ApiResponse<AiSuggestionResponse>> suggestParagraph(ParagraphSuggestionRequest request);

    @Operation(summary = "게시글 요약(Description) AI 추천", description = "게시글 제목과 본문을 기반으로 1~2문장의 메타 요약문을 제안합니다.")
    ResponseEntity<ApiResponse<AiSuggestionResponse>> suggestDescription(
        com.example.atlex.domain.ai.dto.request.DescriptionSuggestionRequest request);
}

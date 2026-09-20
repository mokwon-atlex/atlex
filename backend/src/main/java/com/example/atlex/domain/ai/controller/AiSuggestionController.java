package com.example.atlex.domain.ai.controller;

import com.example.atlex.domain.ai.dto.request.ParagraphSuggestionRequest;
import com.example.atlex.domain.ai.dto.request.TitleSuggestionRequest;
import com.example.atlex.domain.ai.dto.response.AiSuggestionResponse;
import com.example.atlex.domain.ai.service.AiSuggestionService;
import com.example.atlex.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai/suggest")
@RequiredArgsConstructor
public class AiSuggestionController implements AiSuggestionControllerDocs {

    private final AiSuggestionService aiSuggestionService;

    @Override
    @PostMapping("/title")
    public ResponseEntity<ApiResponse<AiSuggestionResponse>> suggestTitle(
        @Valid @RequestBody
        TitleSuggestionRequest request) {
        AiSuggestionResponse response = aiSuggestionService.suggestTitle(request);
        return ResponseEntity.ok(ApiResponse.success(response, "제목 추천이 생성되었습니다."));
    }

    @Override
    @PostMapping("/paragraph")
    public ResponseEntity<ApiResponse<AiSuggestionResponse>> suggestParagraph(
        @Valid @RequestBody
        ParagraphSuggestionRequest request) {
        AiSuggestionResponse response = aiSuggestionService.suggestParagraph(request);
        return ResponseEntity.ok(ApiResponse.success(response, "단락 추천이 생성되었습니다."));
    }

    @Override
    @PostMapping("/description")
    public ResponseEntity<ApiResponse<AiSuggestionResponse>> suggestDescription(
        @Valid @RequestBody
        com.example.atlex.domain.ai.dto.request.DescriptionSuggestionRequest request) {
        AiSuggestionResponse response = aiSuggestionService.suggestDescription(request);
        return ResponseEntity.ok(ApiResponse.success(response, "요약 추천이 생성되었습니다."));
    }
}

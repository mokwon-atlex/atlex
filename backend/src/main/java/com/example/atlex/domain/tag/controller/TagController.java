package com.example.atlex.domain.tag.controller;

import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import com.example.atlex.domain.tag.dto.response.TagListResponse;
import com.example.atlex.domain.tag.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
public class TagController implements TagControllerDocs {

    private final TagService tagService;

    @GetMapping
    public ResponseEntity<ApiResponse<TagListResponse>> getTags(
        @RequestParam
        String userId,
        @RequestParam(required = false)
        Integer limit,
        @RequestParam(required = false)
        Long cursor,
        @AuthenticationPrincipal
        PrincipalDetails principalDetails) {
        Long loginUserId = principalDetails != null ? principalDetails.user().getId() : null;
        TagListResponse response = tagService.getTags(
            userId,
            limit,
            cursor,
            loginUserId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<com.example.atlex.domain.tag.dto.response.PlatformTagItemResponse>>> getAllPlatformTags(
        @RequestParam(required = false, defaultValue = "trending")
        String sort,
        @RequestParam(required = false)
        String keyword,
        @RequestParam(required = false, defaultValue = "0")
        int page,
        @RequestParam(required = false, defaultValue = "12")
        int size) {
        org.springframework.data.domain.Page<com.example.atlex.domain.tag.dto.response.PlatformTagItemResponse> response = tagService
            .getAllTags(sort, keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

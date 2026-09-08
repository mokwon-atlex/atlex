package com.example.atlex.domain.tag.controller;

import com.example.atlex.domain.tag.dto.response.TagListResponse;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Tag", description = "태그 관련 API")
public interface TagControllerDocs {

    @Operation(summary = "태그 목록 조회", description = "특정 사용자의 태그 목록을 커서 기반으로 조회합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": null,
              "data": {
                "content": [
                  {"id": 1, "name": "Spring Boot", "postCount": 5, "thumbnailUrl": null},
                  {"id": 2, "name": "Java", "postCount": 3, "thumbnailUrl": null}
                ],
                "hasNext": false,
                "hasLast": true,
                "nextCursor": null
              },
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "userId 누락 또는 limit/cursor 값 오류", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "VALIDATION_ERROR",
              "message": "입력값이 올바르지 않습니다.",
              "data": null,
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "사용자 없음", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "USER_NOT_FOUND",
              "message": "해당 사용자를 찾을 수 없습니다.",
              "data": null,
              "errors": null
            }""")))
    })
    ResponseEntity<ApiResponse<TagListResponse>> getTags(
        @Parameter(description = "태그를 조회할 사용자 아이디", example = "john123") @RequestParam
        String userId,
        @Parameter(description = "한 페이지 최대 항목 수", example = "20") @RequestParam(required = false)
        Integer limit,
        @Parameter(description = "이전 응답의 nextCursor 값 (첫 페이지는 생략)", example = "5") @RequestParam(required = false)
        Long cursor,
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails);
}

package com.example.atlex.domain.category.controller;

import com.example.atlex.domain.category.dto.request.CategoryCreateRequest;
import com.example.atlex.domain.category.dto.request.CategoryUpdateRequest;
import com.example.atlex.domain.category.dto.response.CategoryListResponse;
import com.example.atlex.domain.category.dto.response.CategoryResponse;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Category", description = "카테고리 관련 API")
public interface CategoryControllerDocs {

    @Operation(summary = "카테고리 목록 조회", description = "특정 사용자의 카테고리 목록을 커서 기반으로 조회합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": null,
              "data": {
                "content": [
                  {"id": 1, "name": "개발 노트", "postCount": 5, "thumbnailUrl": null},
                  {"id": 2, "name": "일상", "postCount": 2, "thumbnailUrl": null}
                ],
                "hasNext": false,
                "nextCursor": null
              },
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
    ResponseEntity<ApiResponse<CategoryListResponse>> getCategories(
        @Parameter(description = "카테고리를 조회할 사용자 아이디", example = "john123") @PathVariable
        String userId,
        @Parameter(description = "한 페이지 최대 항목 수 (기본값: 20)", example = "20") @RequestParam(required = false)
        Integer limit,
        @Parameter(description = "이전 응답의 nextCursor 값 (첫 페이지는 생략)", example = "5") @RequestParam(required = false)
        Long cursor,
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails);

    @Operation(summary = "카테고리 생성", description = "본인의 카테고리를 생성합니다. Authorization 헤더 필수.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "생성 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": null,
              "data": {"id": 3, "name": "개발 노트"},
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "입력값 오류", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "VALIDATION_ERROR",
              "message": "입력값이 올바르지 않습니다.",
              "data": null,
              "errors": [{"field": "name", "message": "카테고리 이름을 입력해주세요."}]
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "타인의 카테고리 생성 시도"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "동일 이름 카테고리 이미 존재", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "DUPLICATE_CATEGORY_NAME",
              "message": "이미 사용 중인 카테고리 이름입니다.",
              "data": null,
              "errors": null
            }""")))
    })
    ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
        @Parameter(description = "카테고리를 생성할 사용자 아이디", example = "john123") @PathVariable
        String userId,
        @Valid @RequestBody
        CategoryCreateRequest request,
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails);

    @Operation(summary = "카테고리 수정", description = "본인의 카테고리 이름을 수정합니다. Authorization 헤더 필수.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": null,
              "data": {"id": 1, "name": "개발 일지"},
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "입력값 오류"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "AUTHENTICATION_ERROR",
              "message": "인증에 실패했습니다.",
              "data": null,
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "타인의 카테고리 수정 시도", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "ACCESS_DENIED",
              "message": "접근 권한이 없습니다.",
              "data": null,
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "카테고리 없음", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "CATEGORY_NOT_FOUND",
              "message": "해당 카테고리를 찾을 수 없습니다.",
              "data": null,
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "동일 이름 카테고리 이미 존재")
    })
    ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
        @Parameter(description = "카테고리 소유자 아이디", example = "john123") @PathVariable
        String userId,
        @Parameter(description = "수정할 카테고리 ID", example = "1") @PathVariable
        Long categoryId,
        @Valid @RequestBody
        CategoryUpdateRequest request,
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails);

    @Operation(summary = "카테고리 삭제", description = "본인의 카테고리를 삭제합니다. Authorization 헤더 필수.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "삭제 성공 (응답 바디 없음)"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "AUTHENTICATION_ERROR",
              "message": "인증에 실패했습니다.",
              "data": null,
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "타인의 카테고리 삭제 시도", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "ACCESS_DENIED",
              "message": "접근 권한이 없습니다.",
              "data": null,
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "카테고리 없음", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "CATEGORY_NOT_FOUND",
              "message": "해당 카테고리를 찾을 수 없습니다.",
              "data": null,
              "errors": null
            }""")))
    })
    ResponseEntity<Void> deleteCategory(
        @Parameter(description = "카테고리 소유자 아이디", example = "john123") @PathVariable
        String userId,
        @Parameter(description = "삭제할 카테고리 ID", example = "1") @PathVariable
        Long categoryId,
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails);
}

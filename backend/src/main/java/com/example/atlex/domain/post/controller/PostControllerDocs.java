package com.example.atlex.domain.post.controller;

import com.example.atlex.domain.post.dto.request.PostCreateRequest;
import com.example.atlex.domain.post.dto.request.PostUpdateRequest;
import com.example.atlex.domain.post.dto.response.PostResponse;
import com.example.atlex.domain.post.dto.response.PostSummaryResponse;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Post", description = "게시글 관련 API")
public interface PostControllerDocs {

    @Operation(summary = "게시글 작성", description = "새 게시글을 작성합니다. Authorization 헤더 필수.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "작성 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": "게시글이 작성되었습니다",
              "data": {
                "id": 1, "categoryId": 2, "title": "Spring Boot 입문 가이드",
                "description": "Spring Boot를 처음 시작하는 분들을 위한 가이드입니다.",
                "content": "## 시작하기\\nSpring Boot는...",
                "thumbnailUrl": null, "authorId": 1, "authorUserId": "john123",
                "authorName": "홍길동", "hits": 0, "likes": 0, "isPublic": true,
                "createdAt": "2024-01-15T10:30:00", "updatedAt": null
              },
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "입력값 오류 (제목/내용 누락 또는 길이 초과)", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "VALIDATION_ERROR",
              "message": "입력값이 올바르지 않습니다.",
              "data": null,
              "errors": [{"field": "title", "message": "제목을 입력해주세요."}]
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "AUTHENTICATION_ERROR",
              "message": "인증에 실패했습니다.",
              "data": null,
              "errors": null
            }""")))
    })
    ResponseEntity<ApiResponse<PostResponse>> createPost(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Valid @RequestBody
        PostCreateRequest request);

    @Operation(summary = "게시글 목록 조회", description = """
        게시글 목록을 페이지 단위로 조회합니다.
        - type=latest: 최신순 (기본값)
        - userId 지정 시 해당 사용자의 게시글만 조회
        - categoryId 지정 시 해당 카테고리 게시글만 조회
        - 비공개 게시글은 작성자 본인에게만 노출됩니다.
        """)
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": null,
              "data": {
                "content": [
                  {
                    "id": 1, "categoryId": 2, "categoryName": "개발 노트",
                    "title": "Spring Boot 입문 가이드",
                    "description": "Spring Boot를 처음 시작하는 분들을 위한 가이드입니다.",
                    "thumbnailUrl": null, "authorId": 1, "authorUserId": "john123",
                    "authorName": "홍길동", "hits": 42, "likes": 7,
                    "createdAt": "2024-01-15T10:30:00"
                  }
                ],
                "pageable": {"pageNumber": 0, "pageSize": 10},
                "totalElements": 1,
                "totalPages": 1,
                "last": true,
                "first": true,
                "empty": false
              },
              "errors": null
            }""")))
    })
    ResponseEntity<ApiResponse<Page<PostSummaryResponse>>> getPostList(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Parameter(description = "정렬 타입 (latest: 최신순)", example = "latest") @RequestParam(defaultValue = "latest")
        String type,
        @Parameter(description = "작성자 아이디로 필터링 (선택)", example = "john123") @RequestParam(required = false)
        String userId,
        @Parameter(description = "카테고리 ID로 필터링 (선택)", example = "2") @RequestParam(required = false)
        Long categoryId,
        @ParameterObject
        Pageable pageable);

    @Operation(summary = "게시글 상세 조회", description = "게시글 ID로 상세 내용을 조회합니다. 비공개 게시글은 작성자 본인만 조회 가능합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": null,
              "data": {
                "id": 1, "categoryId": 2, "title": "Spring Boot 입문 가이드",
                "description": "Spring Boot를 처음 시작하는 분들을 위한 가이드입니다.",
                "content": "## 시작하기\\nSpring Boot는...",
                "thumbnailUrl": null, "authorId": 1, "authorUserId": "john123",
                "authorName": "홍길동", "hits": 42, "likes": 7, "isPublic": true,
                "createdAt": "2024-01-15T10:30:00", "updatedAt": null
              },
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "게시글 없음 (또는 비공개 게시글에 비작성자가 접근)", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "POST_NOT_FOUND",
              "message": "해당 게시글을 찾을 수 없습니다.",
              "data": null,
              "errors": null
            }""")))
    })
    ResponseEntity<ApiResponse<PostResponse>> getPost(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Parameter(description = "조회할 게시글 ID", example = "1") @PathVariable
        Long postId);

    @Operation(summary = "게시글 수정", description = "본인이 작성한 게시글을 수정합니다. Authorization 헤더 필수.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": "게시글이 수정되었습니다",
              "data": {
                "id": 1, "categoryId": 2, "title": "Spring Boot 완전 정복",
                "description": "수정된 설명입니다.",
                "content": "## 수정된 내용\\nSpring Boot는...",
                "thumbnailUrl": null, "authorId": 1, "authorUserId": "john123",
                "authorName": "홍길동", "hits": 42, "likes": 7, "isPublic": true,
                "createdAt": "2024-01-15T10:30:00", "updatedAt": "2024-01-16T09:00:00"
              },
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
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "타인의 게시글 수정 시도", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "ACCESS_DENIED",
              "message": "접근 권한이 없습니다.",
              "data": null,
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "게시글 없음", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "POST_NOT_FOUND",
              "message": "해당 게시글을 찾을 수 없습니다.",
              "data": null,
              "errors": null
            }""")))
    })
    ResponseEntity<ApiResponse<PostResponse>> updatePost(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Parameter(description = "수정할 게시글 ID", example = "1") @PathVariable
        Long postId,
        @Valid @RequestBody
        PostUpdateRequest request);

    @Operation(summary = "게시글 삭제", description = "본인이 작성한 게시글을 삭제합니다. Authorization 헤더 필수.")
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
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "타인의 게시글 삭제 시도", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "ACCESS_DENIED",
              "message": "접근 권한이 없습니다.",
              "data": null,
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "게시글 없음", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "POST_NOT_FOUND",
              "message": "해당 게시글을 찾을 수 없습니다.",
              "data": null,
              "errors": null
            }""")))
    })
    ResponseEntity<Void> deletePost(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Parameter(description = "삭제할 게시글 ID", example = "1") @PathVariable
        Long postId);
}

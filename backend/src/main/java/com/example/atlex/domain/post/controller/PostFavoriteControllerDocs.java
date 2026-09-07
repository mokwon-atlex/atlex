package com.example.atlex.domain.post.controller;

import com.example.atlex.domain.post.dto.response.PostFavoriteResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(name = "Post Favorite", description = "게시글 즐겨찾기 관련 API")
public interface PostFavoriteControllerDocs {

    @Operation(summary = "내 즐겨찾기 목록 조회",
        description = """
            로그인한 사용자가 즐겨찾기한 게시글 목록을 최근 저장순으로 조회합니다. Authorization 헤더 필수.
            - 삭제되었거나 비공개로 전환되어 더 이상 접근할 수 없는 게시글은 목록에서 제외됩니다(본인 글은 비공개여도 노출).
            """)
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
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
                    }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음")
    })
    ResponseEntity<ApiResponse<Page<PostSummaryResponse>>> getMyFavorites(
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalDetails principalDetails,
            @ParameterObject Pageable pageable);

    @Operation(summary = "즐겨찾기 등록",
        description = """
            게시글을 즐겨찾기에 추가합니다. Authorization 헤더 필수.
            - 비공개 게시글은 작성자 본인만 즐겨찾기할 수 있습니다.
            - 이미 즐겨찾기한 상태에서 다시 요청해도 멱등하게 현재 상태를 반환합니다.
            - 존재하지 않는 게시글, 접근 불가능한(비공개·비작성자) 게시글, soft delete된 게시글은 404로 응답합니다.
            """)
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "즐겨찾기 상태 변경 성공",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "SUCCESS",
                      "message": "즐겨찾기 상태가 변경되었습니다",
                      "data": {"postId": 10, "favorited": true},
                      "errors": null
                    }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "게시글 없음 / soft delete / 비공개 게시글에 비작성자가 접근",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "POST_NOT_FOUND",
                      "message": "해당 게시글을 찾을 수 없습니다.",
                      "data": null,
                      "errors": null
                    }""")))
    })
    ResponseEntity<ApiResponse<PostFavoriteResponse>> addFavorite(
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalDetails principalDetails,
            @Parameter(description = "즐겨찾기할 게시글 ID", example = "10") @PathVariable Long postId);

    @Operation(summary = "즐겨찾기 해제",
        description = """
            게시글 즐겨찾기를 해제합니다. Authorization 헤더 필수.
            - 비공개 게시글은 작성자 본인만 요청할 수 있습니다.
            - 즐겨찾기하지 않은 상태에서 해제해도 에러 없이 멱등하게 처리됩니다.
            - 존재하지 않는 게시글, 접근 불가능한(비공개·비작성자) 게시글, soft delete된 게시글은 404로 응답합니다.
            """)
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "즐겨찾기 상태 변경 성공",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "SUCCESS",
                      "message": "즐겨찾기 상태가 변경되었습니다",
                      "data": {"postId": 10, "favorited": false},
                      "errors": null
                    }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "게시글 없음 / soft delete / 비공개 게시글에 비작성자가 접근",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "POST_NOT_FOUND",
                      "message": "해당 게시글을 찾을 수 없습니다.",
                      "data": null,
                      "errors": null
                    }""")))
    })
    ResponseEntity<ApiResponse<PostFavoriteResponse>> removeFavorite(
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalDetails principalDetails,
            @Parameter(description = "즐겨찾기를 해제할 게시글 ID", example = "10") @PathVariable Long postId);
}

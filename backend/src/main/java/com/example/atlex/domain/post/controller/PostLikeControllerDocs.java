package com.example.atlex.domain.post.controller;

import com.example.atlex.domain.post.dto.response.PostLikeResponse;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(name = "Post Like", description = "게시글 좋아요 관련 API")
public interface PostLikeControllerDocs {

    @Operation(summary = "좋아요 등록",
        description = """
            게시글에 좋아요를 등록합니다. Authorization 헤더 필수.
            - 비공개 게시글은 작성자 본인만 좋아요할 수 있습니다(자기 글 좋아요 허용).
            - 이미 좋아요한 상태에서 다시 요청해도 중복 증가 없이 멱등하게 현재 상태를 반환합니다.
            - 존재하지 않는 게시글, 접근 불가능한(비공개·비작성자) 게시글, soft delete된 게시글은 404로 응답합니다.
            """)
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "좋아요 상태 변경 성공",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "SUCCESS",
                      "message": "좋아요 상태가 변경되었습니다",
                      "data": {"postId": 10, "liked": true, "likes": 5},
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
    ResponseEntity<ApiResponse<PostLikeResponse>> like(
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalDetails principalDetails,
            @Parameter(description = "좋아요할 게시글 ID", example = "10") @PathVariable Long postId);

    @Operation(summary = "좋아요 취소",
        description = """
            게시글 좋아요를 취소합니다. Authorization 헤더 필수.
            - 비공개 게시글은 작성자 본인만 요청할 수 있습니다.
            - 좋아요하지 않은 상태에서 취소해도 에러 없이 멱등하게 처리되며 likes는 음수가 되지 않습니다.
            - 존재하지 않는 게시글, 접근 불가능한(비공개·비작성자) 게시글, soft delete된 게시글은 404로 응답합니다.
            """)
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "좋아요 상태 변경 성공",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "SUCCESS",
                      "message": "좋아요 상태가 변경되었습니다",
                      "data": {"postId": 10, "liked": false, "likes": 4},
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
    ResponseEntity<ApiResponse<PostLikeResponse>> unlike(
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalDetails principalDetails,
            @Parameter(description = "좋아요를 취소할 게시글 ID", example = "10") @PathVariable Long postId);
}

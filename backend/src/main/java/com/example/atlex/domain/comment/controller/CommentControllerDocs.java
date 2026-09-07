package com.example.atlex.domain.comment.controller;

import com.example.atlex.domain.comment.dto.request.CommentCreateRequest;
import com.example.atlex.domain.comment.dto.request.CommentUpdateRequest;
import com.example.atlex.domain.comment.dto.response.CommentResponse;
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

import java.util.List;

@Tag(name = "Comment", description = "댓글 관련 API")
public interface CommentControllerDocs {

    @Operation(summary = "댓글 작성", description = "게시글에 댓글을 작성합니다. Authorization 헤더 필수. 비공개 게시글은 작성자 본인만 작성할 수 있습니다.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "작성 성공",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "SUCCESS",
                      "message": "댓글이 작성되었습니다",
                      "data": {
                        "id": 1, "postId": 10, "content": "좋은 글 감사합니다!",
                        "authorId": 1, "authorUserId": "john123", "authorName": "홍길동",
                        "createdAt": "2024-01-15T10:30:00", "updatedAt": null
                      },
                      "errors": null
                    }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "입력값 오류 (내용 누락 또는 1000자 초과)",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "VALIDATION_ERROR",
                      "message": "입력값이 올바르지 않습니다.",
                      "data": null,
                      "errors": [{"message": "댓글을 입력해주세요.", "data": {"key": "content", "value": ""}}]
                    }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "게시글 없음 (또는 비공개 게시글에 비작성자가 접근)",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "POST_NOT_FOUND",
                      "message": "해당 게시글을 찾을 수 없습니다.",
                      "data": null,
                      "errors": null
                    }""")))
    })
    ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalDetails principalDetails,
            @Parameter(description = "댓글을 작성할 게시글 ID", example = "10") @PathVariable Long postId,
            @Valid @RequestBody CommentCreateRequest request);

    @Operation(summary = "댓글 목록 조회",
        description = """
            특정 게시글의 댓글 목록을 조회합니다.
            - 현재 댓글 목록 조회는 페이지네이션을 지원하지 않습니다.
            - 전체 댓글 목록을 createdAt ASC, id ASC 순으로 반환합니다.
            - 비공개 게시글의 댓글은 게시글 작성자 본인에게만 노출됩니다.
            """)
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "SUCCESS",
                      "message": null,
                      "data": [
                        {
                          "id": 1, "postId": 10, "content": "첫 번째 댓글",
                          "authorId": 1, "authorUserId": "john123", "authorName": "홍길동",
                          "createdAt": "2024-01-15T10:30:00", "updatedAt": null
                        }
                      ],
                      "errors": null
                    }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "게시글 없음 (또는 비공개 게시글에 비작성자가 접근)",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "POST_NOT_FOUND",
                      "message": "해당 게시글을 찾을 수 없습니다.",
                      "data": null,
                      "errors": null
                    }""")))
    })
    ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalDetails principalDetails,
            @Parameter(description = "댓글을 조회할 게시글 ID", example = "10") @PathVariable Long postId);

    @Operation(summary = "댓글 수정", description = "본인이 작성한 댓글을 수정합니다. Authorization 헤더 필수. 삭제된 게시글의 댓글은 수정할 수 없습니다.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "SUCCESS",
                      "message": "댓글이 수정되었습니다",
                      "data": {
                        "id": 1, "postId": 10, "content": "수정된 댓글 내용",
                        "authorId": 1, "authorUserId": "john123", "authorName": "홍길동",
                        "createdAt": "2024-01-15T10:30:00", "updatedAt": "2024-01-16T09:00:00"
                      },
                      "errors": null
                    }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "입력값 오류"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "타인의 댓글 수정 시도",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "COMMENT_UPDATE_FORBIDDEN",
                      "message": "본인이 작성한 댓글만 수정할 수 있습니다.",
                      "data": null,
                      "errors": null
                    }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "댓글 없음 (또는 삭제된 게시글의 댓글)",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "COMMENT_NOT_FOUND",
                      "message": "해당 댓글을 찾을 수 없습니다.",
                      "data": null,
                      "errors": null
                    }""")))
    })
    ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalDetails principalDetails,
            @Parameter(description = "수정할 댓글 ID", example = "1") @PathVariable Long commentId,
            @Valid @RequestBody CommentUpdateRequest request);

    @Operation(summary = "댓글 삭제", description = "댓글을 삭제합니다. 댓글 작성자 또는 게시글 작성자만 삭제할 수 있습니다. Authorization 헤더 필수. 삭제된 게시글의 댓글은 삭제할 수 없습니다.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "삭제 성공 (응답 바디 없음)"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "댓글 작성자/게시글 작성자가 아닌 사용자의 삭제 시도",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "COMMENT_DELETE_FORBIDDEN",
                      "message": "댓글을 삭제할 권한이 없습니다.",
                      "data": null,
                      "errors": null
                    }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "댓글 없음 (또는 삭제된 게시글의 댓글)",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "COMMENT_NOT_FOUND",
                      "message": "해당 댓글을 찾을 수 없습니다.",
                      "data": null,
                      "errors": null
                    }""")))
    })
    ResponseEntity<Void> deleteComment(
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalDetails principalDetails,
            @Parameter(description = "삭제할 댓글 ID", example = "1") @PathVariable Long commentId);
}

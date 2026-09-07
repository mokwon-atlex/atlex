package com.example.atlex.domain.profile.controller;

import com.example.atlex.domain.profile.dto.request.ProfileUpdateRequest;
import com.example.atlex.domain.profile.dto.response.PublicUserResponse;
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

@Tag(name = "Profile", description = "공개 프로필 관련 API")
public interface ProfileControllerDocs {

    @Operation(summary = "공개 프로필 조회", description = "사용자 아이디로 공개 프로필을 조회합니다. 인증 불필요.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "SUCCESS",
                      "message": null,
                      "data": {
                        "id": 1,
                        "userId": "john123",
                        "name": "홍길동",
                        "profileImage": "https://example.com/images/profile.jpg",
                        "info": "안녕하세요, 백엔드 개발자입니다."
                      },
                      "errors": null
                    }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "사용자 없음",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "USER_NOT_FOUND",
                      "message": "해당 사용자를 찾을 수 없습니다.",
                      "data": null,
                      "errors": null
                    }""")))
    })
    ResponseEntity<ApiResponse<PublicUserResponse>> getPublicProfileByUserId(
            @Parameter(description = "조회할 사용자 아이디", example = "john123") @PathVariable String userId);

    @Operation(summary = "공개 프로필 수정", description = "본인의 공개 프로필(닉네임, 프로필 이미지, 자기소개)을 수정합니다. Authorization 헤더 필수.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "SUCCESS",
                      "message": "프로필 수정 성공",
                      "data": {
                        "id": 1,
                        "userId": "john123",
                        "name": "새닉네임",
                        "profileImage": "https://example.com/images/new_profile.jpg",
                        "info": "안녕하세요, 풀스택 개발자입니다."
                      },
                      "errors": null
                    }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "입력값 오류 (빈 이름, 길이 초과 등)",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "VALIDATION_ERROR",
                      "message": "입력값이 올바르지 않습니다.",
                      "data": null,
                      "errors": [{"field": "name", "message": "name은 빈 값일 수 없습니다."}]
                    }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "AUTHENTICATION_ERROR",
                      "message": "인증에 실패했습니다.",
                      "data": null,
                      "errors": null
                    }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "타인의 프로필 수정 시도",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "ACCESS_DENIED",
                      "message": "접근 권한이 없습니다.",
                      "data": null,
                      "errors": null
                    }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "닉네임 중복",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "code": "DUPLICATE_NAME",
                      "message": "이미 사용 중인 이름입니다.",
                      "data": null,
                      "errors": null
                    }""")))
    })
    ResponseEntity<ApiResponse<PublicUserResponse>> updatePublicProfile(
            @Parameter(description = "수정할 사용자 아이디", example = "john123") @PathVariable String userId,
            @Valid @RequestBody ProfileUpdateRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalDetails principalDetails);
}

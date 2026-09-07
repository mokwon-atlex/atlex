package com.example.atlex.domain.admin.user.controller;

import com.example.atlex.domain.user.dto.response.UserResponse;
import com.example.atlex.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.List;

@Tag(name = "Admin", description = "관리자 전용 API")
public interface AdminUserControllerDocs {

    @Operation(summary = "전체 사용자 목록 조회", description = "모든 사용자를 조회합니다. ADMIN 권한 필수.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": "전체 사용자 목록을 조회했습니다.",
              "data": [
                {
                  "id": 1,
                  "userId": "john123",
                  "email": "john@example.com",
                  "name": "홍길동",
                  "active": true,
                  "marketingAgreed": false,
                  "createdAt": "2024-01-15T10:30:00",
                  "updatedAt": null
                }
              ],
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "AUTHENTICATION_ERROR",
              "message": "인증에 실패했습니다.",
              "data": null,
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "ADMIN 권한 없음", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "ACCESS_DENIED",
              "message": "접근 권한이 없습니다.",
              "data": null,
              "errors": null
            }""")))
    })
    ResponseEntity<ApiResponse<List<UserResponse>>> findAll();
}

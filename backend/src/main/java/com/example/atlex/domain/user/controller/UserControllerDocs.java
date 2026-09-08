package com.example.atlex.domain.user.controller;

import com.example.atlex.domain.user.dto.request.ChangePasswordRequest;
import com.example.atlex.domain.user.dto.request.EmailCheckRequest;
import com.example.atlex.domain.user.dto.request.SignupRequest;
import com.example.atlex.domain.user.dto.request.UpdateRequest;
import com.example.atlex.domain.user.dto.response.UserResponse;
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

import java.util.List;

@Tag(name = "User", description = "사용자 계정 관련 API")
public interface UserControllerDocs {

    @Operation(summary = "회원가입", description = "새 계정을 생성합니다. 이용약관/개인정보처리방침 동의는 필수입니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "회원가입 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": "회원가입이 완료되었습니다",
              "data": {
                "id": 1,
                "userId": "john123",
                "email": "john@example.com",
                "name": "홍길동",
                "active": true,
                "marketingAgreed": false,
                "createdAt": "2024-01-15T10:30:00",
                "updatedAt": null
              },
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "입력값 오류 또는 약관 미동의", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "VALIDATION_ERROR",
              "message": "입력값이 올바르지 않습니다.",
              "data": null,
              "errors": [
                {"field": "userId", "message": "아이디는 4자 이상 15자 이하로 입력해주세요."},
                {"field": "email", "message": "이메일 형식(예: user@example.com)을 확인해주세요."}
              ]
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "아이디 또는 이메일 중복", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "DUPLICATE_USER_ID",
              "message": "이미 사용 중인 아이디입니다.",
              "data": null,
              "errors": null
            }""")))
    })
    ResponseEntity<ApiResponse<UserResponse>> signup(@Valid @RequestBody
    SignupRequest request);

    @Operation(summary = "내 계정 조회", description = "본인의 계정 정보를 조회합니다. Authorization 헤더 필수.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": "홍길동 님을 찾았습니다",
              "data": {
                "id": 1, "userId": "john123", "email": "john@example.com",
                "name": "홍길동", "active": true, "marketingAgreed": false,
                "createdAt": "2024-01-15T10:30:00", "updatedAt": null
              },
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "AUTHENTICATION_ERROR",
              "message": "인증에 실패했습니다.",
              "data": null,
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "타인의 계정 조회 시도", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "ACCESS_DENIED",
              "message": "접근 권한이 없습니다.",
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
    ResponseEntity<ApiResponse<UserResponse>> findByUserId(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Parameter(description = "조회할 사용자 아이디", example = "john123") @PathVariable
        String userId);

    @Operation(summary = "이메일 중복 확인", description = "회원가입 전 이메일 중복 여부를 확인합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "사용 가능한 이메일", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": "사용 가능한 이메일입니다",
              "data": null,
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "이미 가입된 이메일", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "DUPLICATE_EMAIL",
              "message": "이미 가입된 이메일입니다.",
              "data": null,
              "errors": null
            }""")))
    })
    ResponseEntity<ApiResponse<Void>> checkEmail(
        @Parameter(description = "중복 확인할 이메일", example = "john@example.com") @RequestParam
        String email);

    @Operation(deprecated = true, summary = "[Deprecated] 이메일 중복 확인 - GET /api/v1/users?email={email} 사용 권장")
    ResponseEntity<ApiResponse<Void>> checkEmailDeprecated(@Valid @RequestBody
    EmailCheckRequest request);

    @Operation(deprecated = true, summary = "[Deprecated] 전체 사용자 조회 - GET /api/v1/admin/users 사용 권장")
    ResponseEntity<ApiResponse<List<UserResponse>>> findAllDeprecated();

    @Operation(summary = "사용자 정보 수정", description = "본인의 아이디/이메일/닉네임을 수정합니다. Authorization 헤더 필수.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": "홍길동 님의 정보가 수정되었습니다",
              "data": {
                "id": 1, "userId": "newjohn456", "email": "newemail@example.com",
                "name": "홍길동", "active": true, "marketingAgreed": false,
                "createdAt": "2024-01-15T10:30:00", "updatedAt": "2024-01-16T09:00:00"
              },
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "입력값 오류"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "타인의 계정 수정 시도"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "아이디/이메일/닉네임 중복")
    })
    ResponseEntity<ApiResponse<UserResponse>> update(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Parameter(description = "수정할 사용자 아이디", example = "john123") @PathVariable
        String userId,
        @Valid @RequestBody
        UpdateRequest request);

    @Operation(summary = "비밀번호 변경", description = "현재 비밀번호 확인 후 새 비밀번호로 변경합니다. Authorization 헤더 필수.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "변경 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": "비밀번호가 변경되었습니다",
              "data": null,
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "새 비밀번호가 현재 비밀번호와 동일"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "현재 비밀번호 불일치 또는 인증 토큰 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "타인의 계정 접근 시도")
    })
    ResponseEntity<ApiResponse<Void>> changePassword(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Parameter(description = "비밀번호를 변경할 사용자 아이디", example = "john123") @PathVariable
        String userId,
        @Valid @RequestBody
        ChangePasswordRequest request);

    @Operation(summary = "계정 탈퇴", description = "계정을 삭제합니다. Authorization 헤더 필수.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "탈퇴 성공 (응답 바디 없음)"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "타인의 계정 접근 시도")
    })
    ResponseEntity<Void> delete(
        @Parameter(hidden = true) @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @Parameter(description = "탈퇴할 사용자 아이디", example = "john123") @PathVariable
        String userId);
}

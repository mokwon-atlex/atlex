package com.example.atlex.domain.auth.controller;

import com.example.atlex.domain.auth.dto.request.LoginRequest;
import com.example.atlex.domain.auth.dto.request.OAuth2ExchangeRequest;
import com.example.atlex.domain.auth.dto.request.OAuth2OnboardingRequest;
import com.example.atlex.domain.auth.dto.request.ReissueRequest;
import com.example.atlex.domain.auth.dto.response.TokenResponse;
import com.example.atlex.domain.user.dto.request.SignupRequest;
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
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Auth", description = "인증 관련 API (로그인, 토큰 재발급, 로그아웃)")
public interface AuthControllerDocs {

    @Operation(deprecated = true, summary = "[Deprecated] 회원가입 - POST /api/v1/users 사용 권장")
    ResponseEntity<ApiResponse<UserResponse>> signup(@Valid @RequestBody
    SignupRequest request);

    @Operation(summary = "로그인", description = "아이디/비밀번호로 로그인하여 JWT 액세스·리프레시 토큰을 발급받습니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "로그인 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": "로그인 성공",
              "data": {
                "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
                "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
                "userId": "john123",
                "role": "USER"
              },
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "입력값 오류 (아이디/비밀번호 누락)", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "VALIDATION_ERROR",
              "message": "입력값이 올바르지 않습니다.",
              "data": null,
              "errors": [{"field": "userId", "message": "아이디를 입력해주세요"}]
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "아이디 또는 비밀번호 불일치", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "AUTHENTICATION_ERROR",
              "message": "인증에 실패했습니다.",
              "data": null,
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "계정 잠금 또는 비활성화", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "ACCOUNT_LOCKED",
              "message": "계정이 일시적으로 잠겨있습니다. 잠시 후 다시 시도해주세요.",
              "data": null,
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "로그인 시도 횟수 초과", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "TOO_MANY_LOGIN_ATTEMPTS",
              "message": "로그인 시도가 너무 많습니다. 30분 후 다시 시도해주세요.",
              "data": null,
              "errors": null
            }""")))
    })
    ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody
    LoginRequest request);

    @Operation(summary = "관리자 전용 로그인", description = "ADMIN 권한 계정의 아이디/비밀번호로 로그인하여 JWT 토큰을 발급받습니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "관리자 로그인 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "아이디 또는 비밀번호 불일치"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "관리자 권한 없음 또는 계정 잠금/비활성화")
    })
    ResponseEntity<ApiResponse<TokenResponse>> adminLogin(@Valid @RequestBody
    LoginRequest request);

    @Operation(summary = "토큰 재발급", description = "리프레시 토큰으로 새로운 액세스·리프레시 토큰을 발급받습니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "재발급 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": "토큰이 성공적으로 재발급되었습니다.",
              "data": {
                "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
                "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
                "userId": "john123",
                "role": "USER"
              },
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "유효하지 않거나 만료된 리프레시 토큰", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "INVALID_TOKEN",
              "message": "유효하지 않거나 만료된 토큰입니다.",
              "data": null,
              "errors": null
            }""")))
    })
    ResponseEntity<ApiResponse<TokenResponse>> reissue(@Valid @RequestBody
    ReissueRequest request);

    @Operation(summary = "OAuth2 일회용 코드 교환", description = "OAuth2 콜백으로 받은 일회용 코드를 JWT 액세스·리프레시 토큰으로 교환합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "소셜 로그인 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "유효하지 않거나 만료된 일회용 코드")
    })
    ResponseEntity<ApiResponse<TokenResponse>> exchangeOAuth2Code(@Valid @RequestBody
    OAuth2ExchangeRequest request);

    @Operation(summary = "OAuth2 신규 사용자 온보딩", description = "신규 소셜 사용자가 약관 동의, 아이디, 닉네임을 입력해 계정을 생성하고 JWT 토큰을 발급받습니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "온보딩 및 로그인 완료"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "약관 미동의 또는 입력값 오류"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "유효하지 않거나 만료된 온보딩 토큰"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "아이디 또는 이메일 중복")
    })
    ResponseEntity<ApiResponse<TokenResponse>> completeOAuth2Onboarding(@Valid @RequestBody
    OAuth2OnboardingRequest request);

    @Operation(summary = "로그아웃", description = "현재 로그인된 사용자의 리프레시 토큰을 무효화합니다. Authorization 헤더 필수.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "로그아웃 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": "로그아웃 성공",
              "data": null,
              "errors": null
            }"""))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 토큰 없음 또는 만료", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "AUTHENTICATION_ERROR",
              "message": "인증에 실패했습니다.",
              "data": null,
              "errors": null
            }""")))
    })
    ResponseEntity<ApiResponse<Void>> logout(@Parameter(hidden = true) @AuthenticationPrincipal
    PrincipalDetails details);
}

package com.example.atlex.domain.auth.controller;

import com.example.atlex.domain.auth.dto.request.LoginRequest;
import com.example.atlex.domain.auth.dto.request.ReissueRequest;
import com.example.atlex.domain.auth.dto.response.TokenResponse;
import com.example.atlex.domain.auth.service.AuthService;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import com.example.atlex.domain.user.dto.request.SignupRequest;
import com.example.atlex.domain.user.dto.response.UserResponse;
import com.example.atlex.domain.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController implements AuthControllerDocs {

    private final AuthService authService;
    private final UserService userService;

    @Deprecated
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserResponse>> signup(@Valid @RequestBody
    SignupRequest request) {
        UserResponse response = userService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(response, "회원가입이 완료되었습니다"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody
    LoginRequest request) {
        TokenResponse response = authService.login(request.getUserId(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.success(response, "로그인 성공"));
    }

    @PostMapping("/reissue")
    public ResponseEntity<ApiResponse<TokenResponse>> reissue(@Valid @RequestBody
    ReissueRequest request) {
        TokenResponse response = authService.reissue(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(response, "토큰이 성공적으로 재발급되었습니다."));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal
    PrincipalDetails details) {
        if (details == null) {
            throw new com.example.atlex.domain.auth.exception.AuthenticationException();
        }
        authService.logout(details.user().getId());
        return ResponseEntity.ok(ApiResponse.success(null, "로그아웃 성공"));
    }
}

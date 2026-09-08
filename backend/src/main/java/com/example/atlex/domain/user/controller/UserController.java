package com.example.atlex.domain.user.controller;

import com.example.atlex.domain.user.dto.request.SignupRequest;
import com.example.atlex.domain.user.dto.request.UpdateRequest;
import com.example.atlex.domain.user.dto.request.EmailCheckRequest;
import com.example.atlex.domain.user.dto.request.ChangePasswordRequest;
import com.example.atlex.domain.user.dto.response.UserResponse;
import com.example.atlex.domain.user.service.UserDeletionService;
import com.example.atlex.domain.user.service.UserService;
import com.example.atlex.domain.auth.exception.AuthenticationException;
import com.example.atlex.global.exception.AccessDeniedException;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController implements UserControllerDocs {
    private final UserService userService;
    private final UserDeletionService userDeletionService;

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> signup(@Valid @RequestBody
    SignupRequest request) {
        UserResponse response = userService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(response, "회원가입이 완료되었습니다"));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> findByUserId(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @PathVariable
        String userId) {
        if (principalDetails == null) {
            throw new AuthenticationException();
        }
        if (!principalDetails.user().getUserId().equals(userId)) {
            throw new AccessDeniedException();
        }
        UserResponse response = userService.findByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(response, response.getName() + " 님을 찾았습니다"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Void>> checkEmail(@RequestParam
    String email) {
        userService.checkEmailDuplicate(email);
        return ResponseEntity.ok(ApiResponse.success(null, "사용 가능한 이메일입니다"));
    }

    @Deprecated
    @PostMapping("/email/check")
    public ResponseEntity<ApiResponse<Void>> checkEmailDeprecated(
        @Valid @RequestBody
        EmailCheckRequest request) {
        userService.checkEmailDuplicate(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(null, "사용 가능한 이메일입니다"));
    }

    @Deprecated
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<UserResponse>>> findAllDeprecated() {
        List<UserResponse> response = userService.findAll();
        return ResponseEntity.ok(ApiResponse.success(response, "전체 사용자 목록을 조회했습니다."));
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> update(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @PathVariable
        String userId,
        @Valid @RequestBody
        UpdateRequest request) {
        if (principalDetails == null) {
            throw new AuthenticationException();
        }
        if (!principalDetails.user().getUserId().equals(userId)) {
            throw new AccessDeniedException();
        }
        UserResponse response = userService.update(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response, response.getName() + " 님의 정보가 수정되었습니다"));
    }

    @PatchMapping("/{userId}/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @PathVariable
        String userId,
        @Valid @RequestBody
        ChangePasswordRequest request) {
        if (principalDetails == null) {
            throw new AuthenticationException();
        }
        if (!principalDetails.user().getUserId().equals(userId)) {
            throw new AccessDeniedException();
        }
        userService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null, "비밀번호가 변경되었습니다"));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> delete(
        @AuthenticationPrincipal
        PrincipalDetails principalDetails,
        @PathVariable
        String userId) {
        if (principalDetails == null) {
            throw new AuthenticationException();
        }
        if (!principalDetails.user().getUserId().equals(userId)) {
            throw new AccessDeniedException();
        }
        userDeletionService.delete(userId);
        return ResponseEntity.noContent().build();
    }
}

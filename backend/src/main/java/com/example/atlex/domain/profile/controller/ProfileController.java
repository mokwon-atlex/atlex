package com.example.atlex.domain.profile.controller;

import com.example.atlex.domain.auth.exception.AuthenticationException;
import com.example.atlex.global.exception.AccessDeniedException;
import com.example.atlex.domain.profile.dto.request.ProfileUpdateRequest;
import com.example.atlex.domain.profile.dto.response.PublicUserResponse;
import com.example.atlex.domain.profile.service.ProfileService;
import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
public class ProfileController implements ProfileControllerDocs {
    private final ProfileService profileService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<PublicUserResponse>> getPublicProfileByUserId(
        @PathVariable
        String userId) {
        PublicUserResponse response = profileService.getPublicProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(response, null));
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<ApiResponse<PublicUserResponse>> updatePublicProfile(
        @PathVariable
        String userId,
        @Valid @RequestBody
        ProfileUpdateRequest request,
        @AuthenticationPrincipal
        PrincipalDetails principalDetails) {
        if (principalDetails == null) {
            throw new AuthenticationException();
        }
        if (!principalDetails.user().getUserId().equals(userId)) {
            throw new AccessDeniedException();
        }
        PublicUserResponse response = profileService.updatePublicProfile(userId, request, principalDetails.user());
        return ResponseEntity.ok(ApiResponse.success(response, "프로필 수정 성공"));
    }
}

package com.example.atlex.domain.admin.user.controller;

import com.example.atlex.domain.user.dto.response.UserResponse;
import com.example.atlex.domain.user.service.UserService;
import com.example.atlex.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController implements AdminUserControllerDocs {

    private final UserService userService;

    // 추후 관리자 권한(@PreAuthorize 등) 분리 필요
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> findAll() {
        List<UserResponse> response = userService.findAll();
        return ResponseEntity.ok(ApiResponse.success(response, "전체 사용자 목록을 조회했습니다."));
    }
}

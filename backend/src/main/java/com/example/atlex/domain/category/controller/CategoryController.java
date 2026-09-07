package com.example.atlex.domain.category.controller;

import com.example.atlex.global.response.ApiResponse;
import com.example.atlex.global.security.principal.PrincipalDetails;
import com.example.atlex.domain.category.dto.request.CategoryCreateRequest;
import com.example.atlex.domain.category.dto.request.CategoryUpdateRequest;
import com.example.atlex.domain.category.dto.response.CategoryListResponse;
import com.example.atlex.domain.category.dto.response.CategoryResponse;
import com.example.atlex.domain.category.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/{userId}/categories")
@RequiredArgsConstructor
public class CategoryController implements CategoryControllerDocs {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<CategoryListResponse>> getCategories(
            @PathVariable String userId,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Long cursor,
            @AuthenticationPrincipal PrincipalDetails principalDetails
    ) {
        Long loginUserId = principalDetails != null ? principalDetails.user().getId() : null;
        CategoryListResponse response = categoryService.getCategories(
                userId,
                limit,
                cursor,
                loginUserId
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @PathVariable String userId,
            @Valid @RequestBody CategoryCreateRequest request,
            @AuthenticationPrincipal PrincipalDetails principalDetails
    ) {
        CategoryResponse response = categoryService.createCategory(
                userId,
                request,
                principalDetails.user().getId()
        );
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @PatchMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable String userId,
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryUpdateRequest request,
            @AuthenticationPrincipal PrincipalDetails principalDetails
    ) {
        CategoryResponse response = categoryService.updateCategory(
                userId,
                categoryId,
                request,
                principalDetails.user().getId()
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable String userId,
            @PathVariable Long categoryId,
            @AuthenticationPrincipal PrincipalDetails principalDetails
    ) {
        categoryService.deleteCategory(userId, categoryId, principalDetails.user().getId());
        return ResponseEntity.noContent().build();
    }
}

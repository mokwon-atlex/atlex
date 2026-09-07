package com.example.atlex.domain.category.service;

import com.example.atlex.domain.category.dto.request.CategoryCreateRequest;
import com.example.atlex.domain.category.dto.request.CategoryUpdateRequest;
import com.example.atlex.domain.category.dto.response.CategoryListItemResponse;
import com.example.atlex.domain.category.dto.response.CategoryListResponse;
import com.example.atlex.domain.category.dto.response.CategoryResponse;
import com.example.atlex.domain.category.entity.Category;
import com.example.atlex.domain.category.repository.CategoryRepository;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.category.repository.projection.CategoryPostCountProjection;
import com.example.atlex.domain.category.repository.projection.CategoryThumbnailProjection;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import com.example.atlex.domain.category.exception.CategoryNotFoundException;
import com.example.atlex.domain.category.exception.DuplicateCategoryNameException;
import com.example.atlex.domain.user.exception.UserNotFoundException;
import com.example.atlex.global.exception.AccessDeniedException;
import com.example.atlex.global.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private static final int DEFAULT_LIMIT = 10;
    private static final int MAX_LIMIT = 50;

    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CategoryListResponse getCategories(
            String userId,
            Integer limit,
            Long cursor,
            Long loginUserId
    ) {
        User owner = findActiveUser(userId);
        boolean ownerView = loginUserId != null && owner.getId().equals(loginUserId);
        int effectiveLimit = normalizeLimit(limit);
        validateCursor(cursor);

        List<Category> fetched = categoryRepository.findCategoryPage(
                owner.getId(),
                cursor == null ? Long.MAX_VALUE : cursor,
                PageRequest.of(0, effectiveLimit + 1)
        );

        boolean hasNext = fetched.size() > effectiveLimit;
        List<Category> categories = hasNext
                ? List.copyOf(fetched.subList(0, effectiveLimit))
                : fetched;

        if (categories.isEmpty()) {
            return CategoryListResponse.builder()
                    .content(List.of())
                    .hasNext(false)
                    .nextCursor(null)
                    .build();
        }

        List<Long> categoryIds = categories.stream()
                .map(Category::getId)
                .toList();
        Map<Long, Long> postCounts = postRepository
                .countPostsByCategoryIds(categoryIds, ownerView)
                .stream()
                .collect(Collectors.toMap(
                        CategoryPostCountProjection::getCategoryId,
                        CategoryPostCountProjection::getPostCount
                ));
        Map<Long, String> thumbnails = postRepository
                .findLatestThumbnailsByCategoryIds(categoryIds, ownerView)
                .stream()
                .collect(Collectors.toMap(
                        CategoryThumbnailProjection::getCategoryId,
                        CategoryThumbnailProjection::getThumbnailUrl
                ));

        List<CategoryListItemResponse> content = categories.stream()
                .map(category -> CategoryListItemResponse.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .postCount(postCounts.getOrDefault(category.getId(), 0L))
                        .thumbnailUrl(thumbnails.get(category.getId()))
                        .build())
                .toList();

        return CategoryListResponse.builder()
                .content(content)
                .hasNext(hasNext)
                .nextCursor(hasNext ? categories.get(categories.size() - 1).getId() : null)
                .build();
    }

    @Transactional
    public CategoryResponse createCategory(
            String userId,
            CategoryCreateRequest request,
            Long loginUserId
    ) {
        User owner = findOwner(userId, loginUserId);
        String name = request.getName().trim();
        validateDuplicateName(owner.getId(), name, null);

        try {
            Category category = categoryRepository.saveAndFlush(Category.builder()
                    .user(owner)
                    .name(name)
                    .build());
            return CategoryResponse.from(category);
        } catch (DataIntegrityViolationException e) {
            throw new DuplicateCategoryNameException();
        }
    }

    @Transactional
    public CategoryResponse updateCategory(
            String userId,
            Long categoryId,
            CategoryUpdateRequest request,
            Long loginUserId
    ) {
        User owner = findOwner(userId, loginUserId);
        Category category = findOwnedCategory(categoryId, owner.getId());
        String name = request.getName().trim();
        validateDuplicateName(owner.getId(), name, categoryId);

        category.updateName(name);
        try {
            categoryRepository.flush();
            return CategoryResponse.from(category);
        } catch (DataIntegrityViolationException e) {
            throw new DuplicateCategoryNameException();
        }
    }

    @Transactional
    public void deleteCategory(String userId, Long categoryId, Long loginUserId) {
        User owner = findOwner(userId, loginUserId);
        findOwnedCategory(categoryId, owner.getId());

        postRepository.clearCategoryByCategoryId(categoryId);
        categoryRepository.deleteById(categoryId);
    }

    private User findActiveUser(String userId) {
        return userRepository.findByUserIdAndActiveTrue(userId)
                .orElseThrow(UserNotFoundException::new);
    }

    private User findOwner(String userId, Long loginUserId) {
        User owner = findActiveUser(userId);
        if (loginUserId == null || !owner.getId().equals(loginUserId)) {
            throw new AccessDeniedException();
        }
        return owner;
    }

    private Category findOwnedCategory(Long categoryId, Long ownerId) {
        return categoryRepository.findByIdAndUser_Id(categoryId, ownerId)
                .orElseThrow(CategoryNotFoundException::new);
    }

    private void validateDuplicateName(Long ownerId, String name, Long categoryId) {
        boolean duplicated = categoryId == null
                ? categoryRepository.existsByUser_IdAndName(ownerId, name)
                : categoryRepository.existsByUser_IdAndNameAndIdNot(ownerId, name, categoryId);
        if (duplicated) {
            throw new DuplicateCategoryNameException();
        }
    }

    private int normalizeLimit(Integer limit) {
        int requestedLimit = limit == null ? DEFAULT_LIMIT : limit;
        if (requestedLimit <= 0) {
            throw new ValidationException();
        }
        return Math.min(requestedLimit, MAX_LIMIT);
    }

    private void validateCursor(Long cursor) {
        if (cursor != null && cursor <= 0) {
            throw new ValidationException();
        }
    }
}

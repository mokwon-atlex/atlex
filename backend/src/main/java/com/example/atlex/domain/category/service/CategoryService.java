package com.example.atlex.domain.category.service;

import com.example.atlex.domain.category.dto.request.CategoryCreateRequest;
import com.example.atlex.domain.category.dto.request.CategoryUpdateRequest;
import com.example.atlex.domain.category.dto.response.CategoryListItemResponse;
import com.example.atlex.domain.category.dto.response.CategoryListResponse;
import com.example.atlex.domain.category.dto.response.CategoryResponse;
import com.example.atlex.domain.category.entity.Category;
import com.example.atlex.domain.category.event.CategoryDeletedEvent;
import com.example.atlex.domain.category.repository.CategoryRepository;
import com.example.atlex.domain.post.service.PostReader;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.service.UserReader;
import com.example.atlex.domain.category.exception.CategoryNotFoundException;
import com.example.atlex.domain.category.exception.DuplicateCategoryNameException;
import com.example.atlex.global.exception.AccessDeniedException;
import com.example.atlex.global.pagination.CursorPageRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final PostReader postReader;
    private final UserReader userReader;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public CategoryListResponse getCategories(
        String userId,
        Integer limit,
        Long cursor,
        Long loginUserId) {
        User owner = userReader.getActiveUserByUserId(userId);
        boolean ownerView = loginUserId != null && owner.getId().equals(loginUserId);
        CursorPageRequest pageRequest = CursorPageRequest.of(limit, cursor);

        List<Category> fetched = categoryRepository.findCategoryPage(
            owner.getId(),
            pageRequest.cursor() == null ? Long.MAX_VALUE : pageRequest.cursor(),
            pageRequest.toFetchPageable());

        boolean hasNext = fetched.size() > pageRequest.limit();
        List<Category> categories = hasNext
            ? List.copyOf(fetched.subList(0, pageRequest.limit()))
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
        Map<Long, Long> postCounts = postReader.countPostsByCategoryIds(categoryIds, ownerView);
        Map<Long, String> thumbnails = postReader.findLatestThumbnailsByCategoryIds(categoryIds, ownerView);

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
        Long loginUserId) {
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
        Long loginUserId) {
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

        eventPublisher.publishEvent(new CategoryDeletedEvent(categoryId));
        categoryRepository.deleteById(categoryId);
    }

    private User findOwner(String userId, Long loginUserId) {
        User owner = userReader.getActiveUserByUserId(userId);
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
}

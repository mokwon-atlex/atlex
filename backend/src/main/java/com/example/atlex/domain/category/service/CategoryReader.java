package com.example.atlex.domain.category.service;

import com.example.atlex.domain.category.entity.Category;
import com.example.atlex.domain.category.exception.CategoryNotFoundException;
import com.example.atlex.domain.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 다른 도메인에서 사용자 소유 카테고리를 조회할 때 사용하는 공개 조회 경계입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryReader {

    private final CategoryRepository categoryRepository;

    /**
     * 특정 사용자가 소유한 카테고리를 조회합니다.
     *
     * @param categoryId 카테고리 ID
     * @param ownerId 소유자 사용자 PK
     * @return 카테고리 엔티티
     */
    public Category getOwnedCategory(Long categoryId, Long ownerId) {
        return categoryRepository.findByIdAndUser_Id(categoryId, ownerId)
            .orElseThrow(CategoryNotFoundException::new);
    }
}

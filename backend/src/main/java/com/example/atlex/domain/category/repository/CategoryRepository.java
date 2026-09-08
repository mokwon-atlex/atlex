package com.example.atlex.domain.category.repository;

import com.example.atlex.domain.category.entity.Category;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("""
        SELECT c FROM Category c
        WHERE c.user.id = :userId
          AND c.id < :cursor
        ORDER BY c.id DESC
        """)
    List<Category> findCategoryPage(
        @Param("userId")
        Long userId,
        @Param("cursor")
        Long cursor,
        Pageable pageable);

    Optional<Category> findByIdAndUser_Id(Long id, Long userId);

    boolean existsByUser_IdAndName(Long userId, String name);

    boolean existsByUser_IdAndNameAndIdNot(Long userId, String name, Long id);
}

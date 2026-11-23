package com.example.atlex.domain.post.repository;

import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.category.repository.projection.CategoryPostCountProjection;
import com.example.atlex.domain.category.repository.projection.CategoryThumbnailProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {

    @Override
    @EntityGraph(attributePaths = {"user", "category"})
    Page<Post> findAll(Specification<Post> spec, Pageable pageable);

    long countByUser_IdAndIsDeletedFalseAndIsPublicTrue(Long userId);

    long countByUser_IdAndIsDeletedFalse(Long userId);

    @Query("SELECT p FROM Post p JOIN FETCH p.user LEFT JOIN FETCH p.category WHERE p.id = :id AND p.isDeleted = false")
    Optional<Post> findWithUserById(Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Post p SET p.isDeleted = true WHERE p.user.id = :userId")
    void softDeleteAllByUserId(@Param("userId")
    Long userId);

    @Query("""
        SELECT p.category.id AS categoryId, COUNT(p.id) AS postCount
        FROM Post p
        WHERE p.category.id IN :categoryIds
          AND p.isDeleted = false
          AND (:ownerView = true OR p.isPublic = true)
        GROUP BY p.category.id
        """)
    List<CategoryPostCountProjection> countPostsByCategoryIds(
        @Param("categoryIds")
        List<Long> categoryIds,
        @Param("ownerView")
        boolean ownerView);

    @Query("""
        SELECT p.category.id AS categoryId, p.thumbnailUrl AS thumbnailUrl
        FROM Post p
        WHERE p.category.id IN :categoryIds
          AND p.isDeleted = false
          AND (:ownerView = true OR p.isPublic = true)
          AND p.thumbnailUrl IS NOT NULL
          AND p.id = (
              SELECT MAX(p2.id)
              FROM Post p2
              WHERE p2.category.id = p.category.id
                AND p2.isDeleted = false
                AND (:ownerView = true OR p2.isPublic = true)
                AND p2.thumbnailUrl IS NOT NULL
          )
        """)
    List<CategoryThumbnailProjection> findLatestThumbnailsByCategoryIds(
        @Param("categoryIds")
        List<Long> categoryIds,
        @Param("ownerView")
        boolean ownerView);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Post p SET p.category = null WHERE p.category.id = :categoryId")
    int clearCategoryByCategoryId(@Param("categoryId")
    Long categoryId);

    @EntityGraph(attributePaths = {"user", "category"})
    @Query("""
        SELECT p
        FROM Post p
        WHERE p.isDeleted = false
          AND ((:viewerId IS NOT NULL AND p.user.id = :viewerId) OR p.isPublic = true)
          AND (:userId IS NULL OR p.user.userId = :userId)
          AND (:categoryId IS NULL OR p.category.id = :categoryId)
        ORDER BY p.createdAt DESC, p.id DESC
        """)
    List<Post> findGraphVisiblePosts(
        @Param("viewerId")
        Long viewerId,
        @Param("userId")
        String userId,
        @Param("categoryId")
        Long categoryId);

    @Query("""
        SELECT p
        FROM Post p
        WHERE p.isDeleted = false
          AND p.isPublic = true
        ORDER BY p.id ASC
        """)
    List<Post> findAllPublicGraphSourcePosts();

    long countByIsDeletedFalseAndIsPublicTrue();

    // 좋아요 수는 동시성 문제를 줄이기 위해 원자적 UPDATE로 증가/감소시킨다.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Post p SET p.likes = p.likes + 1 WHERE p.id = :postId")
    void increaseLikes(@Param("postId")
    Long postId);

    // 음수 방지: 감소 결과가 0 미만이 되지 않도록 CASE로 하한을 둔다(H2/MySQL 호환).
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Post p SET p.likes = CASE WHEN p.likes > 0 THEN p.likes - 1 ELSE 0 END WHERE p.id = :postId")
    void decreaseLikes(@Param("postId")
    Long postId);

    // UPDATE 이후 영속성 컨텍스트의 stale 값 대신 최신 likes를 DB에서 다시 읽는다.
    @Query("SELECT p.likes FROM Post p WHERE p.id = :postId")
    Integer findLikesByPostId(@Param("postId")
    Long postId);

    // 조회수는 동시성 경합을 줄이기 위해 원자적 UPDATE로 증가시킨다.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Post p SET p.hits = p.hits + 1 WHERE p.id = :postId")
    void increaseHits(@Param("postId")
    Long postId);

    @Query("SELECT p.hits FROM Post p WHERE p.id = :postId")
    Integer findHitsByPostId(@Param("postId")
    Long postId);
}

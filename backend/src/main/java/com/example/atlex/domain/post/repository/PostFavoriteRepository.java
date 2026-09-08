package com.example.atlex.domain.post.repository;

import com.example.atlex.domain.post.entity.PostFavorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostFavoriteRepository extends JpaRepository<PostFavorite, Long> {

    boolean existsByPost_IdAndUser_Id(Long postId, Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM PostFavorite pf WHERE pf.post.id = :postId AND pf.user.id = :userId")
    int deleteByPostIdAndUserId(@Param("postId")
    Long postId, @Param("userId")
    Long userId);

    // 내 즐겨찾기 목록: 삭제되지 않고 (공개 or 내 글)인 항목만 노출(게시글 목록 가시성 정책과 동일).
    @EntityGraph(attributePaths = {"post", "post.user", "post.category"})
    @Query(value = """
        SELECT pf FROM PostFavorite pf
        JOIN pf.post p
        WHERE pf.user.id = :userId
          AND p.isDeleted = false
          AND (p.isPublic = true OR p.user.id = :userId)
        """, countQuery = """
        SELECT COUNT(pf) FROM PostFavorite pf
        JOIN pf.post p
        WHERE pf.user.id = :userId
          AND p.isDeleted = false
          AND (p.isPublic = true OR p.user.id = :userId)
        """)
    Page<PostFavorite> findFavoritesByUserId(@Param("userId")
    Long userId, Pageable pageable);
}

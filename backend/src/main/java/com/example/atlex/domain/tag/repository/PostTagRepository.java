package com.example.atlex.domain.tag.repository;

import com.example.atlex.domain.tag.entity.Tag;
import com.example.atlex.domain.tag.entity.PostTag;
import com.example.atlex.domain.tag.repository.projection.PostTagNameProjection;
import com.example.atlex.domain.tag.repository.projection.TagPostCountProjection;
import com.example.atlex.domain.tag.repository.projection.TagThumbnailProjection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostTagRepository extends JpaRepository<PostTag, Long> {

    @Query("SELECT pt.tag FROM PostTag pt " +
        "WHERE pt.user.id = :ownerId " +
        "AND pt.post.isDeleted = false " +
        "AND (:isOwner = true OR pt.post.isPublic = true) " +
        "AND (:cursor IS NULL OR pt.tag.id < :cursor) " +
        "GROUP BY pt.tag.id " +
        "ORDER BY pt.tag.id DESC")
    List<Tag> findTagPage(
        @Param("ownerId")
        Long ownerId,
        @Param("cursor")
        Long cursor,
        @Param("isOwner")
        boolean isOwner,
        Pageable pageable);

    @Query("SELECT pt.tag.id AS tagId, COUNT(DISTINCT pt.post.id) AS postCount " +
        "FROM PostTag pt " +
        "WHERE pt.tag.id IN :tagIds AND pt.user.id = :ownerId " +
        "AND pt.post.isDeleted = false " +
        "AND (:isOwner = true OR pt.post.isPublic = true) " +
        "GROUP BY pt.tag.id")
    List<TagPostCountProjection> countPostsByTagIds(
        @Param("tagIds")
        List<Long> tagIds,
        @Param("ownerId")
        Long ownerId,
        @Param("isOwner")
        boolean isOwner);

    @Query("SELECT pt.tag.id AS tagId, pt.post.thumbnailUrl AS thumbnailUrl " +
        "FROM PostTag pt " +
        "WHERE pt.id IN (" +
        "  SELECT MAX(pt2.id) FROM PostTag pt2 " +
        "  WHERE pt2.tag.id IN :tagIds AND pt2.user.id = :ownerId " +
        "  AND pt2.post.isDeleted = false " +
        "  AND (:isOwner = true OR pt2.post.isPublic = true) " +
        "  GROUP BY pt2.tag.id" +
        ")")
    List<TagThumbnailProjection> findLatestThumbnailsByTagIds(
        @Param("tagIds")
        List<Long> tagIds,
        @Param("ownerId")
        Long ownerId,
        @Param("isOwner")
        boolean isOwner);

    @Query("""
        SELECT pt.tag.name
        FROM PostTag pt
        WHERE pt.post.id = :postId
        ORDER BY pt.tag.name ASC
        """)
    List<String> findTagNamesByPostId(@Param("postId")
    Long postId);

    @Query("""
        SELECT pt.post.id AS postId, pt.tag.name AS tagName
        FROM PostTag pt
        WHERE pt.post.id IN :postIds
        ORDER BY pt.post.id ASC, pt.tag.name ASC
        """)
    List<PostTagNameProjection> findTagNamesByPostIds(@Param("postIds")
    List<Long> postIds);
}

package com.example.atlex.domain.graph.repository;

import com.example.atlex.domain.graph.entity.PostRelation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface PostRelationRepository extends JpaRepository<PostRelation, Long> {

    List<PostRelation> findBySourcePostId(Long sourcePostId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM PostRelation pr WHERE pr.sourcePost.id = :sourcePostId")
    void deleteBySourcePostId(@Param("sourcePostId")
    Long sourcePostId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM PostRelation pr WHERE pr.sourcePost.id = :sourcePostId OR pr.targetPost.id = :targetPostId")
    void deleteBySourcePostIdOrTargetPostId(
        @Param("sourcePostId")
        Long sourcePostId,
        @Param("targetPostId")
        Long targetPostId);

    @EntityGraph(attributePaths = {"sourcePost", "targetPost"})
    @Query("""
        SELECT pr
        FROM PostRelation pr
        WHERE pr.sourcePost.id IN :visiblePostIds
          AND pr.targetPost.id IN :visiblePostIds
          AND pr.sourcePost.isPublic = true
          AND pr.targetPost.isPublic = true
          AND pr.score >= :minScore
        ORDER BY pr.score DESC
        """)
    List<PostRelation> findVisibleEdges(
        @Param("visiblePostIds")
        Collection<Long> visiblePostIds,
        @Param("minScore")
        double minScore);

    @EntityGraph(attributePaths = {"sourcePost", "targetPost"})
    @Query("""
        SELECT pr
        FROM PostRelation pr
        WHERE (pr.sourcePost.id = :postId OR pr.targetPost.id = :postId)
          AND pr.sourcePost.isDeleted = false
          AND pr.targetPost.isDeleted = false
          AND pr.sourcePost.isPublic = true
          AND pr.targetPost.isPublic = true
          AND pr.score >= :minScore
        ORDER BY pr.score DESC
        """)
    List<PostRelation> findVisibleCenteredEdges(
        @Param("postId")
        Long postId,
        @Param("minScore")
        double minScore,
        Pageable pageable);
}

package com.example.atlex.domain.graph.repository;

import com.example.atlex.domain.graph.entity.PostKeyword;
import com.example.atlex.domain.graph.repository.projection.KeywordDocumentFrequencyProjection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface PostKeywordRepository extends JpaRepository<PostKeyword, Long> {

    List<PostKeyword> findByPostIdOrderByWeightDesc(Long postId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM PostKeyword pk WHERE pk.post.id = :postId")
    void deleteByPostId(@Param("postId")
    Long postId);

    @Query("""
        SELECT pk
        FROM PostKeyword pk
        JOIN FETCH pk.post p
        JOIN FETCH pk.keyword k
        WHERE k.name IN :keywordNames
          AND p.id <> :sourcePostId
          AND p.isDeleted = false
          AND p.isPublic = true
        ORDER BY pk.weight DESC
        """)
    List<PostKeyword> findPublicCandidatesByKeywordNames(
        @Param("sourcePostId")
        Long sourcePostId,
        @Param("keywordNames")
        List<String> keywordNames,
        Pageable pageable);

    @Query("""
        SELECT COUNT(DISTINCT pk.post.id)
        FROM PostKeyword pk
        WHERE pk.keyword.id = :keywordId
          AND pk.post.isDeleted = false
          AND pk.post.isPublic = true
        """)
    int countPublicDocumentsByKeywordId(@Param("keywordId")
    Long keywordId);

    @Query("""
        SELECT pk.keyword.id AS keywordId, COUNT(DISTINCT pk.post.id) AS documentFrequency
        FROM PostKeyword pk
        WHERE pk.keyword.id IN :keywordIds
          AND pk.post.isDeleted = false
          AND pk.post.isPublic = true
        GROUP BY pk.keyword.id
        """)
    List<KeywordDocumentFrequencyProjection> countPublicDocumentsByKeywordIds(
        @Param("keywordIds")
        Collection<Long> keywordIds);
}

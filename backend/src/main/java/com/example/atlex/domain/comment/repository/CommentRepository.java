package com.example.atlex.domain.comment.repository;

import com.example.atlex.domain.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    // 수정/삭제 권한 판정용 — 댓글·게시글 모두 살아있을 때만 반환, 작성자 + 게시글 작성자 fetch
    @Query("SELECT c FROM Comment c JOIN FETCH c.user JOIN FETCH c.post p JOIN FETCH p.user " +
            "WHERE c.id = :id AND c.isDeleted = false AND p.isDeleted = false")
    Optional<Comment> findActiveWithAuthorById(@Param("id") Long id);

    // 목록 — isDeleted 제외, 작성자 fetch, 오래된 순 + id 보조 정렬(안정 정렬)
    @Query("SELECT c FROM Comment c JOIN FETCH c.user " +
            "WHERE c.post.id = :postId AND c.isDeleted = false " +
            "ORDER BY c.createdAt ASC, c.id ASC")
    List<Comment> findAllByPostId(@Param("postId") Long postId);
}

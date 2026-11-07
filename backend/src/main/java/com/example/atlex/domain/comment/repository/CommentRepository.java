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
    Optional<Comment> findActiveWithAuthorById(@Param("id")
    Long id);

    /**
     * 게시글의 삭제 상태를 포함한 전체 댓글과 답글을 작성자와 함께 조회한다.
     * 답글이 남은 삭제 댓글의 노출 여부를 판단해야 하므로 삭제 댓글도 함께 반환한다.
     * 오래된 순으로 정렬하고 id로 보조 정렬해 순서를 안정적으로 유지한다.
     *
     * @param postId 게시글 ID
     * @return 댓글과 답글 목록
     */
    @Query("SELECT c FROM Comment c JOIN FETCH c.user " +
        "WHERE c.post.id = :postId " +
        "ORDER BY c.createdAt ASC, c.id ASC")
    List<Comment> findAllWithAuthorByPostId(@Param("postId")
    Long postId);
}

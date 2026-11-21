package com.example.atlex.domain.comment.service;

import com.example.atlex.domain.comment.entity.Comment;
import com.example.atlex.domain.comment.exception.CommentNotFoundException;
import com.example.atlex.domain.comment.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 다른 도메인에서 댓글 통계·정보를 조회할 때 사용하는 공개 조회 경계입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentReader {

    private final CommentRepository commentRepository;

    /**
     * 게시글 ID 목록에 대한 활성 댓글 수를 일괄 조회합니다.
     *
     * @param postIds 게시글 ID 목록
     * @return 게시글 ID별 활성 댓글 수 맵
     */
    public Map<Long, Long> countActiveByPostIds(List<Long> postIds) {
        if (postIds == null || postIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : commentRepository.countActiveByPostIds(postIds)) {
            counts.put((Long)row[0], ((Number)row[1]).longValue());
        }
        return counts;
    }

    /**
     * 삭제되지 않은 댓글을 작성자·게시글 정보와 함께 조회합니다.
     *
     * @param commentId 댓글 ID
     * @return 활성 댓글 엔티티
     */
    public Comment getActiveCommentWithAuthor(Long commentId) {
        return commentRepository.findActiveWithAuthorById(commentId)
            .orElseThrow(CommentNotFoundException::new);
    }

    /**
     * ID로 댓글을 조회합니다 (삭제 여부 무관, 관리자 등 특수 조회용).
     *
     * @param commentId 댓글 ID
     * @return 댓글 Optional
     */
    public Optional<Comment> findById(Long commentId) {
        return commentRepository.findById(commentId);
    }

    /**
     * FK 연결 전용 댓글 프록시 참조를 반환합니다.
     *
     * @param commentId 댓글 ID
     * @return 댓글 엔티티 프록시
     */
    public Comment getReferenceById(Long commentId) {
        return commentRepository.getReferenceById(commentId);
    }
}

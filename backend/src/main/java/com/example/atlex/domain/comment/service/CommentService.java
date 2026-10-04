package com.example.atlex.domain.comment.service;

import com.example.atlex.domain.comment.dto.request.CommentCreateRequest;
import com.example.atlex.domain.comment.dto.request.CommentUpdateRequest;
import com.example.atlex.domain.comment.dto.response.CommentResponse;
import com.example.atlex.domain.comment.entity.Comment;
import com.example.atlex.domain.comment.exception.CommentDeleteForbiddenException;
import com.example.atlex.domain.comment.exception.CommentNotFoundException;
import com.example.atlex.domain.comment.exception.CommentReplyDepthExceededException;
import com.example.atlex.domain.comment.exception.CommentUpdateForbiddenException;
import com.example.atlex.domain.comment.repository.CommentRepository;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.service.PostAccessService;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.exception.UserNotFoundException;
import com.example.atlex.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostAccessService postAccessService;
    private final UserRepository userRepository;

    @Transactional
    public CommentResponse createComment(Long postId, CommentCreateRequest request, Long userId) {
        Post post = postAccessService.getAccessiblePost(postId, userId);

        User user = userRepository.findById(userId)
            .orElseThrow(UserNotFoundException::new);

        Comment parent = request.getParentId() == null ? null : findReplyableParent(request.getParentId(), postId);

        Comment comment = Comment.builder()
            .post(post)
            .user(user)
            .parent(parent)
            .content(request.getContent())
            .build();

        return CommentResponse.from(commentRepository.save(comment));
    }

    /**
     * 답글을 달 수 있는 부모 댓글을 조회한다.
     * 다른 게시글의 댓글은 존재하지 않는 댓글로 취급하고, 답글에는 답글을 달 수 없다.
     *
     * @param parentId 부모 댓글 ID
     * @param postId   답글을 작성할 게시글 ID
     * @return 살아있는 최상위 부모 댓글
     * @throws CommentNotFoundException           부모 댓글이 없거나 삭제됐거나 다른 게시글의 댓글일 때
     * @throws CommentReplyDepthExceededException 부모 댓글이 답글일 때
     */
    private Comment findReplyableParent(Long parentId, Long postId) {
        Comment parent = commentRepository.findActiveWithAuthorById(parentId)
            .filter(comment -> comment.getPost().getId().equals(postId))
            .orElseThrow(CommentNotFoundException::new);

        if (parent.isReply()) {
            throw new CommentReplyDepthExceededException();
        }
        return parent;
    }

    /**
     * 게시글의 댓글을 최상위 댓글과 답글의 2단계 구조로 조회한다.
     * 삭제된 답글은 제외하고, 삭제된 최상위 댓글은 살아있는 답글이 있을 때만 삭제 상태로 노출한다.
     *
     * @param postId 게시글 ID
     * @param userId 조회 사용자 DB ID (비로그인 시 null)
     * @return 오래된 순으로 정렬된 최상위 댓글과 각 답글 목록
     */
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long postId, Long userId) {
        postAccessService.getAccessiblePost(postId, userId);

        // 조회 순서(오래된 순)를 유지한 채 최상위 댓글과 살아있는 답글을 분류
        Map<Long, Comment> rootComments = new LinkedHashMap<>();
        Map<Long, List<CommentResponse>> repliesByParentId = new LinkedHashMap<>();
        for (Comment comment : commentRepository.findAllWithAuthorByPostId(postId)) {
            if (!comment.isReply()) {
                rootComments.put(comment.getId(), comment);
            } else if (!Boolean.TRUE.equals(comment.getIsDeleted())) {
                repliesByParentId.computeIfAbsent(comment.getParent().getId(), key -> new ArrayList<>())
                    .add(CommentResponse.from(comment));
            }
        }

        // 답글이 없는 삭제 댓글은 완전히 제외하고, 답글이 있으면 삭제 상태로 자리를 유지
        return rootComments.values().stream()
            .filter(comment -> !Boolean.TRUE.equals(comment.getIsDeleted())
                || repliesByParentId.containsKey(comment.getId()))
            .map(comment -> CommentResponse.of(comment,
                repliesByParentId.getOrDefault(comment.getId(), List.of())))
            .toList();
    }

    @Transactional
    public CommentResponse updateComment(Long commentId, CommentUpdateRequest request, Long userId) {
        Comment comment = commentRepository.findActiveWithAuthorById(commentId)
            .orElseThrow(CommentNotFoundException::new);

        if (!comment.getUser().getId().equals(userId)) {
            throw new CommentUpdateForbiddenException();
        }

        comment.update(request.getContent());
        return CommentResponse.from(comment);
    }

    /**
     * 댓글 또는 답글을 삭제 상태로 전환한다.
     * 데이터는 신고 처리 근거로 보존하며, 목록 노출 여부는 조회 시 답글 유무로 결정한다.
     *
     * @param commentId 삭제할 댓글 ID
     * @param userId    요청 사용자 DB ID
     */
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findActiveWithAuthorById(commentId)
            .orElseThrow(CommentNotFoundException::new);

        boolean isCommentAuthor = comment.getUser().getId().equals(userId);
        boolean isPostAuthor = comment.getPost().getUser().getId().equals(userId);
        if (!isCommentAuthor && !isPostAuthor) {
            throw new CommentDeleteForbiddenException();
        }

        comment.softDelete();
    }
}

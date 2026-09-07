package com.example.atlex.domain.comment.service;

import com.example.atlex.domain.comment.dto.request.CommentCreateRequest;
import com.example.atlex.domain.comment.dto.request.CommentUpdateRequest;
import com.example.atlex.domain.comment.dto.response.CommentResponse;
import com.example.atlex.domain.comment.entity.Comment;
import com.example.atlex.domain.comment.exception.CommentDeleteForbiddenException;
import com.example.atlex.domain.comment.exception.CommentNotFoundException;
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

import java.util.List;

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

        Comment comment = Comment.builder()
                .post(post)
                .user(user)
                .content(request.getContent())
                .build();

        return CommentResponse.from(commentRepository.save(comment));
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long postId, Long userId) {
        postAccessService.getAccessiblePost(postId, userId);

        return commentRepository.findAllByPostId(postId).stream()
                .map(CommentResponse::from)
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

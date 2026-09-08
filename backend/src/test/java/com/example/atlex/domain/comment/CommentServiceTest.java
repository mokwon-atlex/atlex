package com.example.atlex.domain.comment;

import com.example.atlex.domain.comment.dto.request.CommentCreateRequest;
import com.example.atlex.domain.comment.dto.request.CommentUpdateRequest;
import com.example.atlex.domain.comment.entity.Comment;
import com.example.atlex.domain.comment.repository.CommentRepository;
import com.example.atlex.domain.comment.service.CommentService;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.exception.PostNotFoundException;
import com.example.atlex.domain.post.service.PostAccessService;
import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    CommentRepository commentRepository;
    @Mock
    PostAccessService postAccessService;
    @Mock
    UserRepository userRepository;

    @InjectMocks
    CommentService commentService;

    private User user(Long id, String userId) {
        return User.builder().id(id).userId(userId).name(userId).build();
    }

    private Post post(Long id, User owner, boolean isPublic) {
        return Post.builder().id(id).user(owner).title("t").content("c").isPublic(isPublic).build();
    }

    private Comment comment(Long id, Post post, User author, String content) {
        return Comment.builder().id(id).post(post).user(author).content(content).build();
    }

    // ────────────────────────── 작성 ──────────────────────────

    @Test
    @DisplayName("비공개 게시글에 비작성자가 댓글 작성하면 POST_NOT_FOUND")
    void createComment_privatePost_notAuthor() {
        when(postAccessService.getAccessiblePost(10L, 2L)).thenThrow(new PostNotFoundException());

        CustomException e = assertThrows(CustomException.class,
            () -> commentService.createComment(10L, new CommentCreateRequest("댓글"), 2L));

        assertEquals(ErrorCode.POST_NOT_FOUND, e.getErrorCode());
        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    @DisplayName("비공개 게시글에 작성자 본인은 댓글을 저장한다")
    void createComment_privatePost_author() {
        User author = user(1L, "author");
        Post privatePost = post(10L, author, false);
        when(postAccessService.getAccessiblePost(10L, 1L)).thenReturn(privatePost);
        when(userRepository.findById(1L)).thenReturn(Optional.of(author));
        when(commentRepository.save(any(Comment.class))).thenAnswer(inv -> inv.getArgument(0));

        commentService.createComment(10L, new CommentCreateRequest("내 댓글"), 1L);

        verify(commentRepository).save(any(Comment.class));
    }

    // ────────────────────────── 수정 ──────────────────────────

    @Test
    @DisplayName("댓글 수정은 작성자 본인만 가능하다")
    void updateComment_notOwner_forbidden() {
        User author = user(1L, "author");
        User commentAuthor = user(2L, "other");
        Comment comment = comment(100L, post(10L, author, true), commentAuthor, "원본");
        when(commentRepository.findActiveWithAuthorById(100L)).thenReturn(Optional.of(comment));

        CustomException e = assertThrows(CustomException.class,
            () -> commentService.updateComment(100L, new CommentUpdateRequest("수정"), 3L));

        assertEquals(ErrorCode.COMMENT_UPDATE_FORBIDDEN, e.getErrorCode());
    }

    @Test
    @DisplayName("삭제된 게시글의 댓글은 조회되지 않아 수정 시 COMMENT_NOT_FOUND (findActiveWithAuthorById empty)")
    void updateComment_onDeletedPost_notFound() {
        when(commentRepository.findActiveWithAuthorById(100L)).thenReturn(Optional.empty());

        CustomException e = assertThrows(CustomException.class,
            () -> commentService.updateComment(100L, new CommentUpdateRequest("수정"), 2L));

        assertEquals(ErrorCode.COMMENT_NOT_FOUND, e.getErrorCode());
    }

    @Test
    @DisplayName("작성자 본인은 댓글 내용을 수정할 수 있다")
    void updateComment_author_updatesContent() {
        User commentAuthor = user(2L, "other");
        Comment comment = comment(100L, post(10L, user(1L, "author"), true), commentAuthor, "원본");
        when(commentRepository.findActiveWithAuthorById(100L)).thenReturn(Optional.of(comment));

        commentService.updateComment(100L, new CommentUpdateRequest("수정됨"), 2L);

        assertEquals("수정됨", comment.getContent());
    }

    // ────────────────────────── 삭제 ──────────────────────────

    @Test
    @DisplayName("댓글 작성자 본인은 삭제할 수 있다")
    void deleteComment_byCommentAuthor() {
        User commentAuthor = user(2L, "other");
        Comment comment = comment(100L, post(10L, user(1L, "author"), true), commentAuthor, "댓글");
        when(commentRepository.findActiveWithAuthorById(100L)).thenReturn(Optional.of(comment));

        commentService.deleteComment(100L, 2L);

        assertTrue(comment.getIsDeleted());
    }

    @Test
    @DisplayName("게시글 작성자는 타인 댓글을 삭제할 수 있다")
    void deleteComment_byPostAuthor() {
        User postAuthor = user(1L, "author");
        Comment comment = comment(100L, post(10L, postAuthor, true), user(2L, "other"), "댓글");
        when(commentRepository.findActiveWithAuthorById(100L)).thenReturn(Optional.of(comment));

        commentService.deleteComment(100L, 1L);

        assertTrue(comment.getIsDeleted());
    }

    @Test
    @DisplayName("댓글 작성자도 게시글 작성자도 아니면 COMMENT_DELETE_FORBIDDEN")
    void deleteComment_byStranger_forbidden() {
        Comment comment = comment(100L, post(10L, user(1L, "author"), true), user(2L, "other"), "댓글");
        when(commentRepository.findActiveWithAuthorById(100L)).thenReturn(Optional.of(comment));

        CustomException e = assertThrows(CustomException.class,
            () -> commentService.deleteComment(100L, 3L));

        assertEquals(ErrorCode.COMMENT_DELETE_FORBIDDEN, e.getErrorCode());
        assertEquals(false, comment.getIsDeleted());
    }
}

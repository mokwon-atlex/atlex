package com.example.atlex.domain.comment;

import com.example.atlex.domain.comment.dto.request.CommentCreateRequest;
import com.example.atlex.domain.comment.dto.request.CommentUpdateRequest;
import com.example.atlex.domain.comment.dto.response.CommentResponse;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
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

    private Comment reply(Long id, Comment parent, User author, String content) {
        return Comment.builder().id(id).post(parent.getPost()).user(author).parent(parent).content(content).build();
    }

    private Comment deleted(Comment comment) {
        comment.softDelete();
        return comment;
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

    @Test
    @DisplayName("최상위 댓글에 답글을 작성하면 부모 댓글과 연결해 저장한다")
    void createReply_success() {
        User author = user(1L, "author");
        Post post = post(10L, author, true);
        Comment parent = comment(100L, post, author, "부모");
        when(postAccessService.getAccessiblePost(10L, 1L)).thenReturn(post);
        when(userRepository.findById(1L)).thenReturn(Optional.of(author));
        when(commentRepository.findActiveWithAuthorById(100L)).thenReturn(Optional.of(parent));
        when(commentRepository.save(any(Comment.class))).thenAnswer(inv -> inv.getArgument(0));

        CommentResponse response = commentService.createComment(10L, new CommentCreateRequest("답글", 100L), 1L);

        assertEquals(100L, response.getParentId());
        assertNull(response.getReplies());
    }

    @Test
    @DisplayName("답글에 답글을 작성하면 COMMENT_REPLY_DEPTH_EXCEEDED")
    void createReply_toReply_depthExceeded() {
        User author = user(1L, "author");
        Post post = post(10L, author, true);
        Comment childReply = reply(101L, comment(100L, post, author, "부모"), author, "답글");
        when(postAccessService.getAccessiblePost(10L, 1L)).thenReturn(post);
        when(userRepository.findById(1L)).thenReturn(Optional.of(author));
        when(commentRepository.findActiveWithAuthorById(101L)).thenReturn(Optional.of(childReply));

        CustomException e = assertThrows(CustomException.class,
            () -> commentService.createComment(10L, new CommentCreateRequest("답글의 답글", 101L), 1L));

        assertEquals(ErrorCode.COMMENT_REPLY_DEPTH_EXCEEDED, e.getErrorCode());
        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    @DisplayName("다른 게시글의 댓글을 부모로 지정하면 COMMENT_NOT_FOUND")
    void createReply_parentInOtherPost_notFound() {
        User author = user(1L, "author");
        Post post = post(10L, author, true);
        Comment otherPostComment = comment(200L, post(20L, author, true), author, "다른 글 댓글");
        when(postAccessService.getAccessiblePost(10L, 1L)).thenReturn(post);
        when(userRepository.findById(1L)).thenReturn(Optional.of(author));
        when(commentRepository.findActiveWithAuthorById(200L)).thenReturn(Optional.of(otherPostComment));

        CustomException e = assertThrows(CustomException.class,
            () -> commentService.createComment(10L, new CommentCreateRequest("답글", 200L), 1L));

        assertEquals(ErrorCode.COMMENT_NOT_FOUND, e.getErrorCode());
        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    @DisplayName("삭제된 댓글에 답글을 작성하면 COMMENT_NOT_FOUND")
    void createReply_deletedParent_notFound() {
        User author = user(1L, "author");
        Post post = post(10L, author, true);
        when(postAccessService.getAccessiblePost(10L, 1L)).thenReturn(post);
        when(userRepository.findById(1L)).thenReturn(Optional.of(author));
        when(commentRepository.findActiveWithAuthorById(100L)).thenReturn(Optional.empty());

        CustomException e = assertThrows(CustomException.class,
            () -> commentService.createComment(10L, new CommentCreateRequest("답글", 100L), 1L));

        assertEquals(ErrorCode.COMMENT_NOT_FOUND, e.getErrorCode());
        verify(commentRepository, never()).save(any(Comment.class));
    }

    // ────────────────────────── 목록 조회 ──────────────────────────

    @Test
    @DisplayName("목록은 최상위 댓글 아래에 살아있는 답글만 묶어 반환한다")
    void getComments_groupsActiveRepliesUnderRoot() {
        User author = user(1L, "author");
        Post post = post(10L, author, true);
        Comment root = comment(100L, post, author, "부모");
        Comment activeReply = reply(101L, root, author, "답글");
        Comment deletedReply = deleted(reply(102L, root, author, "삭제된 답글"));
        when(postAccessService.getAccessiblePost(10L, null)).thenReturn(post);
        when(commentRepository.findAllWithAuthorByPostId(10L)).thenReturn(List.of(root, activeReply, deletedReply));

        List<CommentResponse> responses = commentService.getComments(10L, null);

        assertEquals(1, responses.size());
        assertEquals(1, responses.get(0).getReplies().size());
        assertEquals(101L, responses.get(0).getReplies().get(0).getId());
    }

    @Test
    @DisplayName("답글이 남은 삭제 댓글은 내용과 작성자를 숨긴 삭제 상태로 유지한다")
    void getComments_deletedRootWithReplies_keptAsDeleted() {
        User author = user(1L, "author");
        Post post = post(10L, author, true);
        Comment root = deleted(comment(100L, post, author, "부모"));
        Comment activeReply = reply(101L, root, author, "답글");
        when(postAccessService.getAccessiblePost(10L, null)).thenReturn(post);
        when(commentRepository.findAllWithAuthorByPostId(10L)).thenReturn(List.of(root, activeReply));

        List<CommentResponse> responses = commentService.getComments(10L, null);

        CommentResponse deletedRoot = responses.get(0);
        assertTrue(deletedRoot.isDeleted());
        assertNull(deletedRoot.getContent());
        assertNull(deletedRoot.getAuthorUserId());
        assertEquals(101L, deletedRoot.getReplies().get(0).getId());
    }

    @Test
    @DisplayName("답글이 없거나 모든 답글이 삭제된 삭제 댓글은 목록에서 제외한다")
    void getComments_deletedRootWithoutActiveReplies_excluded() {
        User author = user(1L, "author");
        Post post = post(10L, author, true);
        Comment lonelyDeleted = deleted(comment(100L, post, author, "답글 없는 삭제 댓글"));
        Comment deletedRoot = deleted(comment(200L, post, author, "답글도 삭제된 댓글"));
        Comment deletedReply = deleted(reply(201L, deletedRoot, author, "삭제된 답글"));
        Comment active = comment(300L, post, author, "살아있는 댓글");
        when(postAccessService.getAccessiblePost(10L, null)).thenReturn(post);
        when(commentRepository.findAllWithAuthorByPostId(10L))
            .thenReturn(List.of(lonelyDeleted, deletedRoot, deletedReply, active));

        List<CommentResponse> responses = commentService.getComments(10L, null);

        assertEquals(1, responses.size());
        assertEquals(300L, responses.get(0).getId());
        assertTrue(responses.get(0).getReplies().isEmpty());
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
    @DisplayName("답글이 있는 댓글을 삭제해도 답글은 그대로 유지된다")
    void deleteComment_withReplies_keepsReplies() {
        User author = user(1L, "author");
        Comment root = comment(100L, post(10L, author, true), author, "부모");
        Comment childReply = reply(101L, root, user(2L, "other"), "답글");
        when(commentRepository.findActiveWithAuthorById(100L)).thenReturn(Optional.of(root));

        commentService.deleteComment(100L, 1L);

        assertTrue(root.getIsDeleted());
        assertEquals(false, childReply.getIsDeleted());
        assertSame(root, childReply.getParent());
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

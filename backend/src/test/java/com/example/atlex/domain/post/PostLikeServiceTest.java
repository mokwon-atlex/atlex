package com.example.atlex.domain.post;

import com.example.atlex.domain.post.dto.response.PostLikeResponse;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.entity.PostLike;
import com.example.atlex.domain.post.exception.PostNotFoundException;
import com.example.atlex.domain.post.repository.PostLikeRepository;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.post.service.PostAccessService;
import com.example.atlex.domain.post.service.PostLikeService;
import com.example.atlex.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostLikeServiceTest {

    @Mock
    PostLikeRepository postLikeRepository;
    @Mock
    PostRepository postRepository;
    @Mock
    UserRepository userRepository;
    @Mock
    PostAccessService postAccessService;

    @InjectMocks
    PostLikeService postLikeService;

    private Post post(Long id, int likes) {
        return Post.builder().id(id).title("t").content("c").likes(likes).build();
    }

    // ────────────────────────── 등록 ──────────────────────────

    @Test
    @DisplayName("좋아요 등록 성공 → 행 생성 + likes 증가, liked=true")
    void like_success() {
        when(postAccessService.getAccessiblePost(10L, 2L)).thenReturn(post(10L, 0));
        when(postLikeRepository.existsByPost_IdAndUser_Id(10L, 2L)).thenReturn(false);
        when(postRepository.findLikesByPostId(10L)).thenReturn(1);

        PostLikeResponse response = postLikeService.like(10L, 2L);

        assertTrue(response.isLiked());
        assertEquals(1, response.getLikes());
        verify(postLikeRepository).saveAndFlush(any(PostLike.class));
        verify(postRepository).increaseLikes(10L);
    }

    @Test
    @DisplayName("이미 좋아요한 경우 중복 증가 없이 현재 상태 반환")
    void like_alreadyLiked_idempotent() {
        when(postAccessService.getAccessiblePost(10L, 2L)).thenReturn(post(10L, 5));
        when(postLikeRepository.existsByPost_IdAndUser_Id(10L, 2L)).thenReturn(true);

        PostLikeResponse response = postLikeService.like(10L, 2L);

        assertTrue(response.isLiked());
        assertEquals(5, response.getLikes());
        verify(postLikeRepository, never()).saveAndFlush(any(PostLike.class));
        verify(postRepository, never()).increaseLikes(any());
    }

    @Test
    @DisplayName("동시 요청 unique 위반은 이미 좋아요로 흡수 → likes 증가 없음")
    void like_uniqueViolation_absorbed() {
        when(postAccessService.getAccessiblePost(10L, 2L)).thenReturn(post(10L, 5));
        when(postLikeRepository.existsByPost_IdAndUser_Id(10L, 2L)).thenReturn(false);
        when(postLikeRepository.saveAndFlush(any(PostLike.class)))
            .thenThrow(new DataIntegrityViolationException("duplicate"));

        PostLikeResponse response = postLikeService.like(10L, 2L);

        assertTrue(response.isLiked());
        assertEquals(5, response.getLikes());
        verify(postRepository, never()).increaseLikes(any());
    }

    @Test
    @DisplayName("접근 불가 게시글에 좋아요 → PostNotFoundException, 행 생성 없음")
    void like_inaccessiblePost() {
        when(postAccessService.getAccessiblePost(999L, 2L)).thenThrow(new PostNotFoundException());

        assertThrows(PostNotFoundException.class, () -> postLikeService.like(999L, 2L));

        verify(postLikeRepository, never()).saveAndFlush(any(PostLike.class));
        verify(postRepository, never()).increaseLikes(any());
    }

    // ────────────────────────── 취소 ──────────────────────────

    @Test
    @DisplayName("좋아요 취소 성공 → 행 삭제 + likes 감소, liked=false")
    void unlike_success() {
        when(postAccessService.getAccessiblePost(10L, 2L)).thenReturn(post(10L, 1));
        when(postLikeRepository.deleteByPostIdAndUserId(10L, 2L)).thenReturn(1);
        when(postRepository.findLikesByPostId(10L)).thenReturn(0);

        PostLikeResponse response = postLikeService.unlike(10L, 2L);

        assertFalse(response.isLiked());
        assertEquals(0, response.getLikes());
        verify(postRepository).decreaseLikes(10L);
    }

    @Test
    @DisplayName("좋아요하지 않은 상태에서 취소해도 감소 없음, 에러 없음")
    void unlike_notLiked_idempotent() {
        when(postAccessService.getAccessiblePost(10L, 2L)).thenReturn(post(10L, 3));
        when(postLikeRepository.deleteByPostIdAndUserId(10L, 2L)).thenReturn(0);

        PostLikeResponse response = postLikeService.unlike(10L, 2L);

        assertFalse(response.isLiked());
        assertEquals(3, response.getLikes());
        verify(postRepository, never()).decreaseLikes(any());
    }

    @Test
    @DisplayName("접근 불가 게시글 좋아요 취소 → PostNotFoundException, 삭제 없음")
    void unlike_inaccessiblePost() {
        when(postAccessService.getAccessiblePost(999L, 2L)).thenThrow(new PostNotFoundException());

        assertThrows(PostNotFoundException.class, () -> postLikeService.unlike(999L, 2L));

        verify(postLikeRepository, never()).deleteByPostIdAndUserId(any(), any());
    }
}

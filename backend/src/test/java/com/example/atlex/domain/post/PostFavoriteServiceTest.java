package com.example.atlex.domain.post;

import com.example.atlex.domain.post.dto.response.PostFavoriteResponse;
import com.example.atlex.domain.post.dto.response.PostSummaryResponse;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.entity.PostFavorite;
import com.example.atlex.domain.post.exception.PostNotFoundException;
import com.example.atlex.domain.post.repository.PostFavoriteRepository;
import com.example.atlex.domain.post.service.PostAccessService;
import com.example.atlex.domain.post.service.PostFavoriteService;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostFavoriteServiceTest {

    @Mock
    PostFavoriteRepository postFavoriteRepository;
    @Mock
    UserRepository userRepository;
    @Mock
    PostAccessService postAccessService;

    @InjectMocks
    PostFavoriteService postFavoriteService;

    private Post post(Long id) {
        return Post.builder().id(id).title("t").content("c").build();
    }

    // ────────────────────────── 등록 ──────────────────────────

    @Test
    @DisplayName("즐겨찾기 등록 성공 → 행 생성, favorited=true")
    void addFavorite_success() {
        when(postAccessService.getAccessiblePost(10L, 2L)).thenReturn(post(10L));
        when(postFavoriteRepository.existsByPost_IdAndUser_Id(10L, 2L)).thenReturn(false);

        PostFavoriteResponse response = postFavoriteService.addFavorite(10L, 2L);

        assertTrue(response.isFavorited());
        assertEquals(10L, response.getPostId());
        verify(postFavoriteRepository).saveAndFlush(any(PostFavorite.class));
    }

    @Test
    @DisplayName("이미 즐겨찾기한 경우 중복 저장 없이 현재 상태 반환")
    void addFavorite_alreadyFavorited_idempotent() {
        when(postAccessService.getAccessiblePost(10L, 2L)).thenReturn(post(10L));
        when(postFavoriteRepository.existsByPost_IdAndUser_Id(10L, 2L)).thenReturn(true);

        PostFavoriteResponse response = postFavoriteService.addFavorite(10L, 2L);

        assertTrue(response.isFavorited());
        verify(postFavoriteRepository, never()).saveAndFlush(any(PostFavorite.class));
    }

    @Test
    @DisplayName("동시 요청 unique 위반은 즐겨찾기 상태로 흡수")
    void addFavorite_uniqueViolation_absorbed() {
        when(postAccessService.getAccessiblePost(10L, 2L)).thenReturn(post(10L));
        when(postFavoriteRepository.existsByPost_IdAndUser_Id(10L, 2L)).thenReturn(false);
        when(postFavoriteRepository.saveAndFlush(any(PostFavorite.class)))
            .thenThrow(new DataIntegrityViolationException("duplicate"));

        PostFavoriteResponse response = postFavoriteService.addFavorite(10L, 2L);

        assertTrue(response.isFavorited());
    }

    @Test
    @DisplayName("접근 불가 게시글에 즐겨찾기 → PostNotFoundException, 행 생성 없음")
    void addFavorite_inaccessiblePost() {
        when(postAccessService.getAccessiblePost(999L, 2L)).thenThrow(new PostNotFoundException());

        assertThrows(PostNotFoundException.class, () -> postFavoriteService.addFavorite(999L, 2L));

        verify(postFavoriteRepository, never()).saveAndFlush(any(PostFavorite.class));
    }

    // ────────────────────────── 해제 ──────────────────────────

    @Test
    @DisplayName("즐겨찾기 해제 성공 → 행 삭제, favorited=false")
    void removeFavorite_success() {
        when(postAccessService.getAccessiblePost(10L, 2L)).thenReturn(post(10L));

        PostFavoriteResponse response = postFavoriteService.removeFavorite(10L, 2L);

        assertFalse(response.isFavorited());
        verify(postFavoriteRepository).deleteByPostIdAndUserId(10L, 2L);
    }

    @Test
    @DisplayName("접근 불가 게시글 즐겨찾기 해제 → PostNotFoundException, 삭제 없음")
    void removeFavorite_inaccessiblePost() {
        when(postAccessService.getAccessiblePost(999L, 2L)).thenThrow(new PostNotFoundException());

        assertThrows(PostNotFoundException.class, () -> postFavoriteService.removeFavorite(999L, 2L));

        verify(postFavoriteRepository, never()).deleteByPostIdAndUserId(any(), any());
    }

    // ────────────────────────── 목록 ──────────────────────────

    @Test
    @DisplayName("내 즐겨찾기 목록 조회 → 게시글 요약으로 매핑")
    void getMyFavorites_mapsToSummary() {
        User author = User.builder().id(1L).userId("author").name("작성자").build();
        Post favoritedPost = Post.builder().id(10L).user(author).title("제목").content("내용").build();
        PostFavorite favorite = PostFavorite.builder().post(favoritedPost).build();
        Page<PostFavorite> page = new PageImpl<>(List.of(favorite));
        when(postFavoriteRepository.findFavoritesByUserId(eq(2L), any(Pageable.class))).thenReturn(page);

        Page<PostSummaryResponse> result = postFavoriteService.getMyFavorites(2L, Pageable.ofSize(10));

        assertEquals(1, result.getTotalElements());
        assertEquals(10L, result.getContent().get(0).getId());
        assertEquals("제목", result.getContent().get(0).getTitle());
    }
}

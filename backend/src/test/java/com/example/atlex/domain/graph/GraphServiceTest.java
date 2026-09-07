package com.example.atlex.domain.graph;

import com.example.atlex.domain.graph.dto.response.PostGraphResponse;
import com.example.atlex.domain.graph.entity.PostRelation;
import com.example.atlex.domain.graph.repository.PostRelationRepository;
import com.example.atlex.domain.graph.service.GraphService;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.tag.repository.PostTagRepository;
import com.example.atlex.domain.tag.repository.projection.PostTagNameProjection;
import com.example.atlex.domain.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GraphServiceTest {

    @Mock PostRepository postRepository;
    @Mock PostTagRepository postTagRepository;
    @Mock PostRelationRepository postRelationRepository;

    @Test
    @DisplayName("전체 그래프 조회 시 태그를 게시글 ID 목록으로 한 번에 조회한다")
    void getGraphLoadsTagsInBulk() {
        GraphService service = newService();
        User user = User.builder().id(1L).userId("author").name("작성자").build();
        Post first = Post.builder().id(10L).user(user).title("first").content("first").isPublic(true).build();
        Post second = Post.builder().id(11L).user(user).title("second").content("second").isPublic(true).build();

        when(postRepository.findGraphVisiblePosts(null, null, null)).thenReturn(List.of(first, second));
        when(postTagRepository.findTagNamesByPostIds(List.of(10L, 11L))).thenReturn(List.of(
                new TestPostTagName(10L, "graph"),
                new TestPostTagName(10L, "spring"),
                new TestPostTagName(11L, "jpa")
        ));
        when(postRelationRepository.findVisibleEdges(eq(List.of(10L, 11L)), eq(0.15))).thenReturn(List.of());

        PostGraphResponse response = service.getGraph(null, null, null, null);

        assertEquals(List.of("graph", "spring"), response.getNodes().get(0).getTags());
        assertEquals(List.of("jpa"), response.getNodes().get(1).getTags());
        verify(postTagRepository).findTagNamesByPostIds(List.of(10L, 11L));
        verify(postTagRepository, never()).findTagNamesByPostId(anyLong());
    }

    @Test
    @DisplayName("게시글 중심 그래프 조회 시 태그를 게시글 ID 목록으로 한 번에 조회한다")
    void getPostGraphLoadsTagsInBulk() {
        GraphService service = newService();
        User user = User.builder().id(1L).userId("author").name("작성자").build();
        Post center = Post.builder().id(10L).user(user).title("center").content("center").isPublic(true).build();
        Post target = Post.builder().id(11L).user(user).title("target").content("target").isPublic(true).build();
        PostRelation relation = PostRelation.of(center, target, 0.5, "spring");

        when(postRepository.findWithUserById(10L)).thenReturn(Optional.of(center));
        when(postRelationRepository.findVisibleCenteredEdges(eq(10L), eq(0.15), any(Pageable.class)))
                .thenReturn(List.of(relation));
        when(postTagRepository.findTagNamesByPostIds(List.of(10L, 11L))).thenReturn(List.of(
                new TestPostTagName(10L, "spring"),
                new TestPostTagName(11L, "graph")
        ));

        PostGraphResponse response = service.getPostGraph(10L, null, null, null);

        assertEquals(List.of("spring"), response.getNodes().get(0).getTags());
        assertEquals(List.of("graph"), response.getNodes().get(1).getTags());
        verify(postTagRepository).findTagNamesByPostIds(List.of(10L, 11L));
        verify(postTagRepository, never()).findTagNamesByPostId(anyLong());
    }

    private GraphService newService() {
        return new GraphService(postRepository, postTagRepository, postRelationRepository);
    }

    private record TestPostTagName(
            Long postId,
            String tagName
    ) implements PostTagNameProjection {
        @Override
        public Long getPostId() {
            return postId;
        }

        @Override
        public String getTagName() {
            return tagName;
        }
    }
}

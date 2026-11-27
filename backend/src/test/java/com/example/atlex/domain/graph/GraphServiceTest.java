package com.example.atlex.domain.graph;

import com.example.atlex.domain.follow.service.FollowReader;
import com.example.atlex.domain.graph.dto.response.PostGraphResponse;
import com.example.atlex.domain.graph.entity.PostRelation;
import com.example.atlex.domain.graph.repository.PostRelationRepository;
import com.example.atlex.domain.graph.config.GraphProperties;
import com.example.atlex.domain.graph.service.GraphService;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.service.PostReader;
import com.example.atlex.domain.tag.service.PostTagService;
import com.example.atlex.domain.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GraphServiceTest {

    @Mock
    PostReader postReader;
    @Mock
    PostTagService postTagService;
    @Mock
    PostRelationRepository postRelationRepository;
    @Mock
    FollowReader followReader;

    @Test
    @DisplayName("전체 그래프 조회 시 태그를 게시글 ID 목록으로 한 번에 조회한다")
    void getGraphLoadsTagsInBulk() {
        GraphService service = newService();
        User user = User.builder().id(1L).userId("author").name("작성자").build();
        Post first = Post.builder().id(10L).user(user).title("first").content("first").isPublic(true).build();
        Post second = Post.builder().id(11L).user(user).title("second").content("second").isPublic(true).build();

        when(postReader.findGraphVisiblePosts(null, null, null)).thenReturn(List.of(first, second));
        when(postTagService.findTagNamesByPostIds(List.of(10L, 11L))).thenReturn(Map.of(
            10L, List.of("graph", "spring"),
            11L, List.of("jpa")));
        when(postRelationRepository.findVisibleEdges(eq(List.of(10L, 11L)), eq(0.15))).thenReturn(List.of());

        PostGraphResponse response = service.getGraph(null, null, null, null);

        assertEquals(List.of("graph", "spring"), response.getNodes().get(0).getTags());
        assertEquals(List.of("jpa"), response.getNodes().get(1).getTags());
        verify(postTagService).findTagNamesByPostIds(List.of(10L, 11L));
        verify(postTagService, never()).findTagNamesByPostId(anyLong());
    }

    @Test
    @DisplayName("게시글 중심 그래프 조회 시 태그를 게시글 ID 목록으로 한 번에 조회한다")
    void getPostGraphLoadsTagsInBulk() {
        GraphService service = newService();
        User user = User.builder().id(1L).userId("author").name("작성자").build();
        Post center = Post.builder().id(10L).user(user).title("center").content("center").isPublic(true).build();
        Post target = Post.builder().id(11L).user(user).title("target").content("target").isPublic(true).build();
        PostRelation relation = PostRelation.of(center, target, 0.5, "spring");

        when(postReader.findWithUserById(10L)).thenReturn(Optional.of(center));
        when(postRelationRepository.findVisibleCenteredEdges(eq(10L), eq(0.15), any(Pageable.class)))
            .thenReturn(List.of(relation));
        when(postTagService.findTagNamesByPostIds(List.of(10L, 11L))).thenReturn(Map.of(
            10L, List.of("spring"),
            11L, List.of("graph")));

        PostGraphResponse response = service.getPostGraph(10L, null, null, null);

        assertEquals(List.of("spring"), response.getNodes().get(0).getTags());
        assertEquals(List.of("graph"), response.getNodes().get(1).getTags());
        verify(postTagService).findTagNamesByPostIds(List.of(10L, 11L));
        verify(postTagService, never()).findTagNamesByPostId(anyLong());
    }

    @Test
    @DisplayName("탐색 그래프 노드가 상한을 초과하면 내 글과 연관 글을 우선 선별해 100개로 제한한다")
    void getGraphCapsNodesAndPrioritizesOwnAndRelatedPosts() {
        GraphService service = newService();
        User viewer = User.builder().id(1L).userId("viewer").name("나").build();
        User other = User.builder().id(2L).userId("other").name("타인").build();

        Post ownPost = Post.builder().id(1L).user(viewer).title("own").content("own").isPublic(true).build();
        Post relatedPost = Post.builder().id(2L).user(other).title("related").content("related").isPublic(true).build();

        List<Post> allPosts = new java.util.ArrayList<>();
        allPosts.add(ownPost);
        allPosts.add(relatedPost);
        for (long i = 3; i <= 120; i++) {
            allPosts.add(Post.builder().id(i).user(other).title("post" + i).content("c" + i).isPublic(true).build());
        }

        PostRelation relation = PostRelation.of(ownPost, relatedPost, 0.8, "spring");
        when(postReader.findGraphVisiblePosts(1L, null, null)).thenReturn(allPosts);
        when(postRelationRepository.findVisibleEdges(any(), eq(0.15))).thenReturn(List.of(relation));
        when(followReader.findFollowingUserIds(1L)).thenReturn(Set.of());
        when(postTagService.findTagNamesByPostIds(any())).thenReturn(Map.of());

        PostGraphResponse response = service.getGraph(null, null, null, 1L);

        assertEquals(GraphService.MAX_GRAPH_NODES, response.getNodes().size());
        assertEquals(1L, response.getNodes().get(0).getId());
        assertEquals(2L, response.getNodes().get(1).getId());
    }

    @Test
    @DisplayName("전체 그래프 조회 시 양방향 관계(A→B, B→A)를 하나의 간선으로 병합한다")
    void getGraphMergesBidirectionalEdges() {
        GraphService service = newService();
        User user = User.builder().id(1L).userId("author").name("작성자").build();
        Post first = Post.builder().id(10L).user(user).title("first").content("first").isPublic(true).build();
        Post second = Post.builder().id(11L).user(user).title("second").content("second").isPublic(true).build();
        PostRelation forward = PostRelation.of(first, second, 0.82, "spring,jpa");
        PostRelation reverse = PostRelation.of(second, first, 0.64, "jpa,graph");

        when(postReader.findGraphVisiblePosts(null, null, null)).thenReturn(List.of(first, second));
        when(postTagService.findTagNamesByPostIds(List.of(10L, 11L))).thenReturn(Map.of());
        when(postRelationRepository.findVisibleEdges(eq(List.of(10L, 11L)), eq(0.15)))
            .thenReturn(List.of(forward, reverse));

        PostGraphResponse response = service.getGraph(null, null, null, null);

        assertEquals(1, response.getEdges().size());
        assertEquals(10L, response.getEdges().get(0).getSourcePostId());
        assertEquals(11L, response.getEdges().get(0).getTargetPostId());
        assertEquals(0.82, response.getEdges().get(0).getScore());
        assertEquals(List.of("spring", "jpa", "graph"), response.getEdges().get(0).getSharedKeywords());
    }

    @Test
    @DisplayName("게시글 중심 그래프 조회 시 양방향 관계를 하나의 간선으로 병합한다")
    void getPostGraphMergesBidirectionalEdges() {
        GraphService service = newService();
        User user = User.builder().id(1L).userId("author").name("작성자").build();
        Post center = Post.builder().id(10L).user(user).title("center").content("center").isPublic(true).build();
        Post target = Post.builder().id(11L).user(user).title("target").content("target").isPublic(true).build();
        PostRelation forward = PostRelation.of(center, target, 0.75, "spring");
        PostRelation reverse = PostRelation.of(target, center, 0.50, "spring,graph");

        when(postReader.findWithUserById(10L)).thenReturn(Optional.of(center));
        when(postRelationRepository.findVisibleCenteredEdges(eq(10L), eq(0.15), any(Pageable.class)))
            .thenReturn(List.of(forward, reverse));
        when(postTagService.findTagNamesByPostIds(List.of(10L, 11L))).thenReturn(Map.of());

        PostGraphResponse response = service.getPostGraph(10L, null, null, null);

        assertEquals(2, response.getNodes().size());
        assertEquals(1, response.getEdges().size());
        assertEquals(0.75, response.getEdges().get(0).getScore());
        assertEquals(List.of("spring", "graph"), response.getEdges().get(0).getSharedKeywords());
    }

    private GraphService newService() {
        return new GraphService(
            postReader,
            postTagService,
            postRelationRepository,
            followReader,
            new GraphProperties(1.5, 1.0, 2.0, 8, 50, 5, 0.15));
    }
}

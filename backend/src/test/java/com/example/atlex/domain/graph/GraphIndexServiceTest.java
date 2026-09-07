package com.example.atlex.domain.graph;

import com.example.atlex.domain.graph.entity.Keyword;
import com.example.atlex.domain.graph.entity.PostKeyword;
import com.example.atlex.domain.graph.entity.PostRelation;
import com.example.atlex.domain.graph.repository.projection.KeywordDocumentFrequencyProjection;
import com.example.atlex.domain.graph.repository.KeywordRepository;
import com.example.atlex.domain.graph.repository.PostKeywordRepository;
import com.example.atlex.domain.graph.repository.PostRelationRepository;
import com.example.atlex.domain.graph.service.GraphIndexService;
import com.example.atlex.domain.graph.keyword.KeywordExtractor;
import com.example.atlex.domain.graph.keyword.KeywordWeightCalculator;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.tag.repository.PostTagRepository;
import com.example.atlex.domain.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.support.TransactionOperations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GraphIndexServiceTest {

    @Mock PostRepository postRepository;
    @Mock PostTagRepository postTagRepository;
    @Mock KeywordRepository keywordRepository;
    @Mock PostKeywordRepository postKeywordRepository;
    @Mock PostRelationRepository postRelationRepository;

    @Test
    @DisplayName("게시글의 기존 키워드를 지우고 제목, 본문, 태그 기반 PostKeyword를 다시 저장한다")
    void refreshPostKeywords() {
        GraphIndexService service = newService();
        User user = User.builder().id(1L).userId("author").name("작성자").build();
        Post post = Post.builder()
                .id(10L)
                .user(user)
                .title("Spring Graph")
                .content("Spring graph")
                .isPublic(true)
                .build();
        Keyword spring = Keyword.builder().id(100L).name("spring").documentFrequency(0).build();
        Keyword graph = Keyword.builder().id(101L).name("graph").documentFrequency(0).build();
        Keyword jpa = Keyword.builder().id(102L).name("jpa").documentFrequency(0).build();

        when(postRepository.findWithUserById(10L)).thenReturn(Optional.of(post));
        when(postRepository.countByIsDeletedFalseAndIsPublicTrue()).thenReturn(10L);
        when(postTagRepository.findTagNamesByPostId(10L)).thenReturn(List.of("JPA"));
        when(keywordRepository.findAllByNameIn(List.of("spring", "graph", "jpa")))
                .thenReturn(List.of(spring, graph));
        when(keywordRepository.saveAll(any())).thenReturn(List.of(jpa));
        when(postKeywordRepository.countPublicDocumentsByKeywordIds(List.of(100L, 101L)))
                .thenReturn(List.of(
                        new TestKeywordDocumentFrequency(100L, 2L),
                        new TestKeywordDocumentFrequency(101L, 1L)
                ));

        service.refreshPostKeywords(10L);

        verify(postKeywordRepository).deleteByPostId(10L);
        verify(keywordRepository).findAllByNameIn(List.of("spring", "graph", "jpa"));
        verify(postKeywordRepository).countPublicDocumentsByKeywordIds(List.of(100L, 101L));
        verify(postKeywordRepository, never()).countPublicDocumentsByKeywordId(anyLong());
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<PostKeyword>> captor = ArgumentCaptor.forClass(List.class);
        verify(postKeywordRepository).saveAll(captor.capture());
        List<PostKeyword> saved = captor.getValue();

        assertTrue(saved.stream().anyMatch(postKeyword -> postKeyword.getKeyword().getName().equals("spring")));
        assertTrue(saved.stream().anyMatch(postKeyword -> postKeyword.getKeyword().getName().equals("graph")));
        assertTrue(saved.stream().anyMatch(postKeyword -> postKeyword.getKeyword().getName().equals("jpa")));
        assertEquals(3, spring.getDocumentFrequency());
        assertEquals(2, graph.getDocumentFrequency());
        assertEquals(1, jpa.getDocumentFrequency());
    }

    @Test
    @DisplayName("공유 고가중치 키워드 후보만 점수화해 기준 이상 관계를 저장한다")
    void refreshRelationsFromKeywordCandidates() {
        GraphIndexService service = newService();
        User user = User.builder().id(1L).userId("author").name("작성자").build();
        Post source = Post.builder().id(10L).user(user).title("source").content("source").isPublic(true).build();
        Post strong = Post.builder().id(11L).user(user).title("strong").content("strong").isPublic(true).build();
        Post weak = Post.builder().id(12L).user(user).title("weak").content("weak").isPublic(true).build();
        Keyword spring = Keyword.builder().id(100L).name("spring").documentFrequency(2).build();
        Keyword graph = Keyword.builder().id(101L).name("graph").documentFrequency(2).build();

        when(postRepository.findWithUserById(10L)).thenReturn(Optional.of(source));
        when(postKeywordRepository.findByPostIdOrderByWeightDesc(10L)).thenReturn(List.of(
                PostKeyword.of(source, spring, 1, 1, 0, 5.0),
                PostKeyword.of(source, graph, 1, 0, 0, 3.0)
        ));
        when(postKeywordRepository.findPublicCandidatesByKeywordNames(eq(10L), eq(List.of("spring", "graph")), any(Pageable.class)))
                .thenReturn(List.of(
                        PostKeyword.of(strong, spring, 1, 2, 0, 4.0),
                        PostKeyword.of(strong, graph, 1, 1, 0, 3.5),
                        PostKeyword.of(weak, spring, 0, 1, 0, 0.05)
                ));

        service.refreshRelations(10L);

        verify(postRelationRepository).deleteBySourcePostId(10L);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<PostRelation>> captor = ArgumentCaptor.forClass(List.class);
        verify(postRelationRepository).saveAll(captor.capture());
        List<PostRelation> saved = captor.getValue();

        assertEquals(1, saved.size());
        assertEquals(strong, saved.get(0).getTargetPost());
        assertTrue(saved.get(0).getScore() >= 0.15);
        assertEquals("spring,graph", saved.get(0).getSharedKeywords());
    }

    @Test
    @DisplayName("공개 그래프 소스 글의 키워드를 모두 갱신한 뒤 관계를 재계산한다")
    void rebuildPublicGraph() {
        RecordingTransactionOperations transactionOperations = new RecordingTransactionOperations();
        User user = User.builder().id(1L).userId("author").name("작성자").build();
        Post first = Post.builder().id(10L).user(user).title("first").content("first").isPublic(true).build();
        Post second = Post.builder().id(11L).user(user).title("second").content("second").isPublic(true).build();

        when(postRepository.findAllPublicGraphSourcePosts()).thenReturn(List.of(first, second));
        GraphIndexService service = spy(newService(transactionOperations));
        doNothing().when(service).refreshPostKeywords(anyLong());
        doNothing().when(service).refreshRelations(anyLong());

        int rebuiltCount = service.rebuildPublicGraph();

        assertEquals(2, rebuiltCount);
        InOrder inOrder = inOrder(service);
        inOrder.verify(service).refreshPostKeywords(10L);
        inOrder.verify(service).refreshPostKeywords(11L);
        inOrder.verify(service).refreshRelations(10L);
        inOrder.verify(service).refreshRelations(11L);
        assertEquals(4, transactionOperations.executedCount);
    }

    private GraphIndexService newService() {
        return newService(new ImmediateTransactionOperations());
    }

    private GraphIndexService newService(TransactionOperations transactionOperations) {
        return new GraphIndexService(
                postRepository,
                postTagRepository,
                keywordRepository,
                postKeywordRepository,
                postRelationRepository,
                new KeywordExtractor(),
                new KeywordWeightCalculator(),
                transactionOperations
        );
    }

    private record TestKeywordDocumentFrequency(
            Long keywordId,
            Long documentFrequency
    ) implements KeywordDocumentFrequencyProjection {
        @Override
        public Long getKeywordId() {
            return keywordId;
        }

        @Override
        public Long getDocumentFrequency() {
            return documentFrequency;
        }
    }

    private static class RecordingTransactionOperations implements TransactionOperations {
        private int executedCount;

        @Override
        public <T> T execute(org.springframework.transaction.support.TransactionCallback<T> action) {
            executedCount++;
            return action.doInTransaction(null);
        }
    }

    private static class ImmediateTransactionOperations implements TransactionOperations {
        @Override
        public <T> T execute(org.springframework.transaction.support.TransactionCallback<T> action) {
            return action.doInTransaction(null);
        }
    }
}

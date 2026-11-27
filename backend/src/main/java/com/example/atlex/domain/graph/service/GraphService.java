package com.example.atlex.domain.graph.service;

import com.example.atlex.domain.follow.service.FollowReader;
import com.example.atlex.domain.graph.config.GraphProperties;
import com.example.atlex.domain.graph.dto.response.GraphEdgeResponse;
import com.example.atlex.domain.graph.dto.response.GraphNodeResponse;
import com.example.atlex.domain.graph.dto.response.PostGraphResponse;
import com.example.atlex.domain.graph.entity.PostRelation;
import com.example.atlex.domain.graph.repository.PostRelationRepository;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.exception.PostNotFoundException;
import com.example.atlex.domain.post.service.PostReader;
import com.example.atlex.domain.tag.service.PostTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GraphService {

    private static final int DEFAULT_CENTER_LIMIT = 10;
    private static final int MAX_CENTER_LIMIT = 50;
    public static final int MAX_GRAPH_NODES = 100;

    private final PostReader postReader;
    private final PostTagService postTagService;
    private final PostRelationRepository postRelationRepository;
    private final FollowReader followReader;
    private final GraphProperties graphProperties;

    @Transactional(readOnly = true)
    public PostGraphResponse getGraph(String userId, Long categoryId, Double minScore, Long viewerId) {
        String normalizedUserId = normalizeUserId(userId);
        double effectiveMinScore = minScore == null ? graphProperties.getMinScore() : minScore;
        List<Post> visiblePosts = postReader.findGraphVisiblePosts(viewerId, normalizedUserId, categoryId);
        List<Post> posts = selectPrioritizedPosts(visiblePosts, viewerId, normalizedUserId, effectiveMinScore);
        List<Long> visiblePostIds = posts.stream().map(Post::getId).toList();
        Map<Long, List<String>> tagNamesByPostId = postTagService.findTagNamesByPostIds(visiblePostIds);

        List<GraphNodeResponse> nodes = posts.stream()
            .map(post -> GraphNodeResponse.from(post, tagNamesByPostId.getOrDefault(post.getId(), List.of())))
            .toList();
        List<GraphEdgeResponse> edges = visiblePostIds.isEmpty()
            ? List.of()
            : mergeUndirectedRelations(postRelationRepository.findVisibleEdges(visiblePostIds, effectiveMinScore))
                .stream()
                .map(MergedRelation::toResponse)
                .toList();

        return PostGraphResponse.builder()
            .nodes(nodes)
            .edges(edges)
            .build();
    }

    private List<Post> selectPrioritizedPosts(
        List<Post> posts,
        Long viewerId,
        String normalizedUserId,
        double effectiveMinScore) {
        if (posts.size() <= MAX_GRAPH_NODES) {
            return posts;
        }
        if (normalizedUserId != null) {
            return posts.subList(0, MAX_GRAPH_NODES);
        }

        Comparator<Post> popularityOrder = Comparator
            .comparingInt((Post post) -> (post.getLikes() != null ? post.getLikes() : 0) * 2
                + (post.getHits() != null ? post.getHits() : 0))
            .reversed()
            .thenComparing(Post::getId, Comparator.reverseOrder());

        if (viewerId == null) {
            return posts.stream().sorted(popularityOrder).limit(MAX_GRAPH_NODES).toList();
        }

        Set<Long> ownPostIds = posts.stream()
            .filter(post -> Objects.equals(post.getUser().getId(), viewerId))
            .map(Post::getId)
            .collect(Collectors.toSet());

        Map<Long, Double> relatedScoreByPostId = new LinkedHashMap<>();
        if (!ownPostIds.isEmpty()) {
            List<Long> allPostIds = posts.stream().map(Post::getId).toList();
            for (PostRelation relation : postRelationRepository.findVisibleEdges(allPostIds, effectiveMinScore)) {
                Long sourceId = relation.getSourcePost().getId();
                Long targetId = relation.getTargetPost().getId();
                if (ownPostIds.contains(sourceId) && !ownPostIds.contains(targetId)) {
                    relatedScoreByPostId.merge(targetId, relation.getScore(), Math::max);
                } else if (ownPostIds.contains(targetId) && !ownPostIds.contains(sourceId)) {
                    relatedScoreByPostId.merge(sourceId, relation.getScore(), Math::max);
                }
            }
        }

        Set<Long> followingUserIds = followReader.findFollowingUserIds(viewerId);

        Map<Long, Post> selected = new LinkedHashMap<>();
        // 1순위: 내 글
        posts.stream()
            .filter(post -> ownPostIds.contains(post.getId()))
            .limit(MAX_GRAPH_NODES)
            .forEach(post -> selected.put(post.getId(), post));

        // 2순위: 내 글과 제목·내용·태그로 연관성이 높은 글
        if (selected.size() < MAX_GRAPH_NODES && !relatedScoreByPostId.isEmpty()) {
            posts.stream()
                .filter(post -> !selected.containsKey(post.getId()) && relatedScoreByPostId.containsKey(post.getId()))
                .sorted(Comparator
                    .comparingDouble((Post post) -> relatedScoreByPostId.getOrDefault(post.getId(), 0.0))
                    .reversed()
                    .thenComparing(popularityOrder))
                .limit(MAX_GRAPH_NODES - selected.size())
                .forEach(post -> selected.put(post.getId(), post));
        }

        // 3순위: 팔로우한 작성자의 인기·최신 글
        if (selected.size() < MAX_GRAPH_NODES && !followingUserIds.isEmpty()) {
            posts.stream()
                .filter(post -> !selected.containsKey(post.getId())
                    && followingUserIds.contains(post.getUser().getId()))
                .sorted(popularityOrder)
                .limit(MAX_GRAPH_NODES - selected.size())
                .forEach(post -> selected.put(post.getId(), post));
        }

        // 4순위: 나머지 공개 글(인기·최신순)
        if (selected.size() < MAX_GRAPH_NODES) {
            posts.stream()
                .filter(post -> !selected.containsKey(post.getId()))
                .sorted(popularityOrder)
                .limit(MAX_GRAPH_NODES - selected.size())
                .forEach(post -> selected.put(post.getId(), post));
        }

        return new ArrayList<>(selected.values());
    }

    @Transactional(readOnly = true)
    public PostGraphResponse getPostGraph(Long postId, Double minScore, Integer limit, Long viewerId) {
        Post centerPost = postReader.findWithUserById(postId)
            .orElseThrow(PostNotFoundException::new);

        if (!isVisibleTo(centerPost, viewerId)) {
            throw new PostNotFoundException();
        }

        int effectiveLimit = normalizeLimit(limit);
        int queryLimit = Math.min(effectiveLimit * 2, MAX_CENTER_LIMIT * 2);
        List<PostRelation> relations = Boolean.TRUE.equals(centerPost.getIsPublic())
            ? postRelationRepository.findVisibleCenteredEdges(
                postId,
                minScore == null ? graphProperties.getMinScore() : minScore,
                PageRequest.of(0, queryLimit))
            : List.of();
        List<MergedRelation> mergedRelations = mergeUndirectedRelations(relations).stream()
            .limit(effectiveLimit)
            .toList();

        Map<Long, Post> postsById = new LinkedHashMap<>();
        postsById.put(centerPost.getId(), centerPost);
        for (MergedRelation relation : mergedRelations) {
            postsById.putIfAbsent(relation.sourcePost.getId(), relation.sourcePost);
            postsById.putIfAbsent(relation.targetPost.getId(), relation.targetPost);
        }

        List<Long> postIds = postsById.keySet().stream().toList();
        Map<Long, List<String>> tagNamesByPostId = postTagService.findTagNamesByPostIds(postIds);

        List<GraphNodeResponse> nodes = postsById.values().stream()
            .map(post -> GraphNodeResponse.from(post, tagNamesByPostId.getOrDefault(post.getId(), List.of())))
            .toList();
        List<GraphEdgeResponse> edges = mergedRelations.stream()
            .map(MergedRelation::toResponse)
            .toList();

        return PostGraphResponse.builder()
            .nodes(nodes)
            .edges(edges)
            .build();
    }

    private String normalizeUserId(String userId) {
        return userId == null || userId.isBlank() ? null : userId.trim();
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null) {
            return DEFAULT_CENTER_LIMIT;
        }
        return Math.max(1, Math.min(limit, MAX_CENTER_LIMIT));
    }

    private boolean isVisibleTo(Post post, Long viewerId) {
        return Boolean.TRUE.equals(post.getIsPublic())
            || (viewerId != null && Objects.equals(post.getUser().getId(), viewerId));
    }

    /** 양방향(A→B, B→A)으로 저장된 관계 행을 하나의 무방향 간선으로 병합한다. */
    private List<MergedRelation> mergeUndirectedRelations(List<PostRelation> relations) {
        Map<EdgePair, MergedRelation> mergedByPair = new LinkedHashMap<>();
        for (PostRelation relation : relations) {
            Long sourceId = relation.getSourcePost().getId();
            Long targetId = relation.getTargetPost().getId();
            if (Objects.equals(sourceId, targetId)) {
                continue;
            }
            EdgePair pair = toEdgePair(sourceId, targetId);
            MergedRelation existing = mergedByPair.get(pair);
            if (existing == null) {
                mergedByPair.put(pair, MergedRelation.from(relation));
            } else {
                existing.merge(relation);
            }
        }
        return new ArrayList<>(mergedByPair.values());
    }

    private EdgePair toEdgePair(Long firstId, Long secondId) {
        return firstId <= secondId ? new EdgePair(firstId, secondId) : new EdgePair(secondId, firstId);
    }

    private record EdgePair(
        long lowPostId,
        long highPostId) {
    }

    private static final class MergedRelation {
        private Post sourcePost;
        private Post targetPost;
        private double score;
        private final LinkedHashSet<String> sharedKeywords = new LinkedHashSet<>();

        private static MergedRelation from(PostRelation relation) {
            MergedRelation merged = new MergedRelation();
            merged.sourcePost = relation.getSourcePost();
            merged.targetPost = relation.getTargetPost();
            merged.score = relation.getScore();
            merged.addKeywords(relation.getSharedKeywords());
            return merged;
        }

        private void merge(PostRelation relation) {
            if (relation.getScore() > this.score) {
                this.sourcePost = relation.getSourcePost();
                this.targetPost = relation.getTargetPost();
                this.score = relation.getScore();
            }
            addKeywords(relation.getSharedKeywords());
        }

        private void addKeywords(String rawKeywords) {
            if (rawKeywords == null || rawKeywords.isBlank()) {
                return;
            }
            for (String keyword : rawKeywords.split(",")) {
                String trimmed = keyword.trim();
                if (!trimmed.isEmpty()) {
                    sharedKeywords.add(trimmed);
                }
            }
        }

        private GraphEdgeResponse toResponse() {
            return GraphEdgeResponse.builder()
                .sourcePostId(sourcePost.getId())
                .targetPostId(targetPost.getId())
                .score(score)
                .sharedKeywords(new ArrayList<>(sharedKeywords))
                .build();
        }
    }
}

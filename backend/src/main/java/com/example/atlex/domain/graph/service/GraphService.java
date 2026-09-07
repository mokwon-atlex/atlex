package com.example.atlex.domain.graph.service;

import com.example.atlex.domain.graph.dto.response.GraphEdgeResponse;
import com.example.atlex.domain.graph.dto.response.GraphNodeResponse;
import com.example.atlex.domain.graph.dto.response.PostGraphResponse;
import com.example.atlex.domain.graph.entity.PostRelation;
import com.example.atlex.domain.graph.repository.PostRelationRepository;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.exception.PostNotFoundException;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.tag.repository.PostTagRepository;
import com.example.atlex.domain.tag.repository.projection.PostTagNameProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class GraphService {

    private static final double DEFAULT_MIN_SCORE = 0.15;
    private static final int DEFAULT_CENTER_LIMIT = 10;
    private static final int MAX_CENTER_LIMIT = 50;

    private final PostRepository postRepository;
    private final PostTagRepository postTagRepository;
    private final PostRelationRepository postRelationRepository;

    @Transactional(readOnly = true)
    public PostGraphResponse getGraph(String userId, Long categoryId, Double minScore, Long viewerId) {
        List<Post> posts = postRepository.findGraphVisiblePosts(viewerId, normalizeUserId(userId), categoryId);
        List<Long> visiblePostIds = posts.stream().map(Post::getId).toList();
        Map<Long, List<String>> tagNamesByPostId = findTagNamesByPostId(visiblePostIds);

        List<GraphNodeResponse> nodes = posts.stream()
            .map(post -> GraphNodeResponse.from(post, tagNamesByPostId.getOrDefault(post.getId(), List.of())))
            .toList();
        List<GraphEdgeResponse> edges = visiblePostIds.isEmpty()
            ? List.of()
            : postRelationRepository.findVisibleEdges(
                visiblePostIds,
                minScore == null ? DEFAULT_MIN_SCORE : minScore).stream().map(GraphEdgeResponse::from).toList();

        return PostGraphResponse.builder()
            .nodes(nodes)
            .edges(edges)
            .build();
    }

    @Transactional(readOnly = true)
    public PostGraphResponse getPostGraph(Long postId, Double minScore, Integer limit, Long viewerId) {
        Post centerPost = postRepository.findWithUserById(postId)
            .orElseThrow(PostNotFoundException::new);

        if (!isVisibleTo(centerPost, viewerId)) {
            throw new PostNotFoundException();
        }

        List<PostRelation> relations = Boolean.TRUE.equals(centerPost.getIsPublic())
            ? postRelationRepository.findVisibleCenteredEdges(
                postId,
                minScore == null ? DEFAULT_MIN_SCORE : minScore,
                PageRequest.of(0, normalizeLimit(limit)))
            : List.of();

        Map<Long, Post> postsById = new LinkedHashMap<>();
        postsById.put(centerPost.getId(), centerPost);
        for (PostRelation relation : relations) {
            postsById.putIfAbsent(relation.getSourcePost().getId(), relation.getSourcePost());
            postsById.putIfAbsent(relation.getTargetPost().getId(), relation.getTargetPost());
        }

        List<Long> postIds = postsById.keySet().stream().toList();
        Map<Long, List<String>> tagNamesByPostId = findTagNamesByPostId(postIds);

        List<GraphNodeResponse> nodes = postsById.values().stream()
            .map(post -> GraphNodeResponse.from(post, tagNamesByPostId.getOrDefault(post.getId(), List.of())))
            .toList();
        List<GraphEdgeResponse> edges = relations.stream()
            .map(GraphEdgeResponse::from)
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

    private Map<Long, List<String>> findTagNamesByPostId(List<Long> postIds) {
        Map<Long, List<String>> tagNamesByPostId = new LinkedHashMap<>();
        postIds.forEach(postId -> tagNamesByPostId.put(postId, new ArrayList<>()));
        if (postIds.isEmpty()) {
            return tagNamesByPostId;
        }

        for (PostTagNameProjection tagName : postTagRepository.findTagNamesByPostIds(postIds)) {
            tagNamesByPostId
                .computeIfAbsent(tagName.getPostId(), ignored -> new ArrayList<>())
                .add(tagName.getTagName());
        }
        return tagNamesByPostId;
    }

    private boolean isVisibleTo(Post post, Long viewerId) {
        return Boolean.TRUE.equals(post.getIsPublic())
            || (viewerId != null && Objects.equals(post.getUser().getId(), viewerId));
    }
}

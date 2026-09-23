package com.example.atlex.domain.post.service;

import com.example.atlex.domain.post.dto.request.PostCreateRequest;
import com.example.atlex.domain.post.dto.request.PostUpdateRequest;
import com.example.atlex.domain.post.dto.response.PostResponse;
import com.example.atlex.domain.post.dto.response.PostSummaryResponse;
import com.example.atlex.domain.category.entity.Category;
import com.example.atlex.domain.graph.service.GraphIndexService;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.category.repository.CategoryRepository;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.tag.entity.PostTag;
import com.example.atlex.domain.tag.entity.Tag;
import com.example.atlex.domain.tag.repository.PostTagRepository;
import com.example.atlex.domain.tag.repository.TagRepository;
import com.example.atlex.domain.tag.repository.projection.PostTagNameProjection;
import com.example.atlex.domain.tag.service.TagService;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import com.example.atlex.domain.category.exception.CategoryNotFoundException;
import com.example.atlex.domain.post.exception.PostDeleteForbiddenException;
import com.example.atlex.domain.post.exception.PostNotFoundException;
import com.example.atlex.domain.post.exception.PostUpdateForbiddenException;
import com.example.atlex.domain.user.exception.UserNotFoundException;
import com.example.atlex.global.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import com.example.atlex.domain.github.event.PostGitHubSyncEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final GraphIndexService graphIndexService;
    private final PostTagRepository postTagRepository;
    private final TagRepository tagRepository;
    private final TagService tagService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public PostResponse createPost(PostCreateRequest request, Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(UserNotFoundException::new);

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndUser_Id(request.getCategoryId(), user.getId())
                .orElseThrow(CategoryNotFoundException::new);
        }

        Post post = Post.builder()
            .user(user)
            .category(category)
            .title(request.getTitle())
            .description(request.getDescription())
            .content(request.getContent())
            .thumbnailUrl(request.getThumbnailUrl())
            .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
            .build();

        Post savedPost = postRepository.save(post);
        List<String> tags = syncPostTags(user, savedPost, request.getTags());
        graphIndexService.refreshPostGraph(savedPost.getId());
        eventPublisher.publishEvent(PostGitHubSyncEvent.create(savedPost.getId(), user.getId()));

        return PostResponse.from(savedPost, tags);
    }

    @Transactional(readOnly = true)
    public Page<PostSummaryResponse> getPostList(
        String type,
        String userId,
        Long categoryId,
        Pageable pageable,
        Long id) {
        return getPostList(type, userId, categoryId, null, pageable, id);
    }

    @Transactional(readOnly = true)
    public Page<PostSummaryResponse> getPostList(
        String type,
        String userId,
        Long categoryId,
        String tag,
        Pageable pageable,
        Long id) {
        String normalizedType = normalizeType(type);
        String normalizedUserId = normalizeUserId(userId);
        String normalizedTag = normalizeTag(tag);
        Sort sort = "trending".equals(normalizedType)
            ? Sort.by(
                Sort.Order.desc("likes"),
                Sort.Order.desc("hits"),
                Sort.Order.desc("createdAt"))
            : Sort.by(Sort.Order.desc("createdAt"));
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        Page<Post> posts = (id != null)
            ? postRepository.findAllVisibleTo(id, normalizedUserId, categoryId, normalizedTag, sortedPageable)
            : postRepository.findAllPublic(normalizedUserId, categoryId, normalizedTag, sortedPageable);

        List<Long> postIds = posts.getContent().stream().map(Post::getId).toList();
        Map<Long, List<String>> tagMap = findTagNamesByPostIds(postIds);

        return posts.map(post -> PostSummaryResponse.from(post, tagMap.getOrDefault(post.getId(), List.of())));
    }

    private String normalizeType(String type) {
        if (type == null) {
            return "latest";
        }
        String normalizedType = type.trim().toLowerCase(Locale.ROOT);
        return "trending".equals(normalizedType) ? "trending" : "latest";
    }

    private String normalizeUserId(String userId) {
        return userId == null || userId.isBlank() ? null : userId.trim();
    }

    private String normalizeTag(String tag) {
        return tag == null || tag.isBlank() ? null : tag.trim();
    }

    @Transactional(readOnly = true)
    public PostResponse getPost(Long postId, Long id) {
        Post post = postRepository.findWithUserById(postId)
            .orElseThrow(PostNotFoundException::new);

        // 조회에서는 비공개 글 존재 여부를 숨기기 위해 작성자가 아니면 404로 응답한다.
        // 수정/삭제는 권한 위반을 명확히 표현하기 위해 403 정책을 유지한다.
        if (!Boolean.TRUE.equals(post.getIsPublic()) && !Objects.equals(post.getUser().getId(), id)) {
            throw new PostNotFoundException();
        }

        List<String> tags = postTagRepository.findTagNamesByPostId(postId);
        return PostResponse.from(post, tags);
    }

    @Transactional
    public PostResponse updatePost(Long postId, PostUpdateRequest request, Long id) {
        Post post = postRepository.findWithUserById(postId)
            .orElseThrow(PostNotFoundException::new);

        if (!post.getUser().getId().equals(id)) {
            throw new PostUpdateForbiddenException();
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndUser_Id(
                request.getCategoryId(),
                post.getUser().getId())
                .orElseThrow(CategoryNotFoundException::new);
            post.updateCategory(category);
        }

        post.update(
            request.getTitle(),
            request.getDescription(),
            request.getContent(),
            request.getThumbnailUrl(),
            request.getIsPublic());

        if (request.getTags() != null) {
            postTagRepository.deleteByPostId(post.getId());
            syncPostTags(post.getUser(), post, request.getTags());
        }

        graphIndexService.refreshPostGraph(post.getId());
        eventPublisher.publishEvent(PostGitHubSyncEvent.update(post.getId(), id));
        List<String> tags = postTagRepository.findTagNamesByPostId(post.getId());
        return PostResponse.from(post, tags);
    }

    @Transactional
    public void deletePost(Long postId, Long id) {
        Post post = postRepository.findWithUserById(postId)
            .orElseThrow(PostNotFoundException::new);

        if (!post.getUser().getId().equals(id)) {
            throw new PostDeleteForbiddenException();
        }

        String postTitle = post.getTitle();
        post.softDelete();
        graphIndexService.removePostGraph(post.getId());
        eventPublisher.publishEvent(PostGitHubSyncEvent.delete(postId, postTitle, id));
    }

    private List<String> syncPostTags(User user, Post post, List<String> rawTags) {
        if (rawTags == null || rawTags.isEmpty()) {
            return List.of();
        }

        Map<String, String> distinctTags = new LinkedHashMap<>();
        for (String rawTag : rawTags) {
            if (rawTag == null) {
                continue;
            }
            String trimmed = rawTag.trim();
            if (trimmed.isBlank()) {
                continue;
            }
            distinctTags.putIfAbsent(trimmed.toLowerCase(Locale.ROOT), trimmed);
        }

        List<String> normalizedTags = new ArrayList<>(distinctTags.values());
        if (normalizedTags.isEmpty()) {
            return List.of();
        }

        if (normalizedTags.size() > 10) {
            throw new ValidationException();
        }

        List<PostTag> postTags = new ArrayList<>(normalizedTags.size());
        for (String tagName : normalizedTags) {
            Tag tag = tagService.getOrCreateTag(tagName);
            postTags.add(PostTag.of(user, post, tag));
        }
        postTagRepository.saveAll(postTags);
        return normalizedTags;
    }

    private Map<Long, List<String>> findTagNamesByPostIds(List<Long> postIds) {
        if (postIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, List<String>> tagNamesByPostId = new LinkedHashMap<>();
        for (PostTagNameProjection projection : postTagRepository.findTagNamesByPostIds(postIds)) {
            tagNamesByPostId
                .computeIfAbsent(projection.getPostId(), ignored -> new ArrayList<>())
                .add(projection.getTagName());
        }
        return tagNamesByPostId;
    }
}

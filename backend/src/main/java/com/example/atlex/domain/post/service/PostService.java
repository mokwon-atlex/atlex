package com.example.atlex.domain.post.service;

import com.example.atlex.domain.post.dto.request.PostCreateRequest;
import com.example.atlex.domain.post.dto.request.PostUpdateRequest;
import com.example.atlex.domain.post.dto.response.PostResponse;
import com.example.atlex.domain.post.dto.response.PostSummaryResponse;
import com.example.atlex.domain.category.entity.Category;
import com.example.atlex.domain.category.service.CategoryReader;
import com.example.atlex.domain.comment.service.CommentReader;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.event.PostGraphSyncEvent;
import com.example.atlex.domain.post.repository.PostFavoriteRepository;
import com.example.atlex.domain.post.repository.PostLikeRepository;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.tag.service.PostTagService;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.service.UserReader;
import com.example.atlex.domain.post.exception.PostDeleteForbiddenException;
import com.example.atlex.domain.post.exception.PostNotFoundException;
import com.example.atlex.domain.post.exception.PostUpdateForbiddenException;
import com.example.atlex.global.security.sanitizer.HtmlSanitizer;
import lombok.RequiredArgsConstructor;
import com.example.atlex.domain.github.event.PostGitHubSyncEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserReader userReader;
    private final CategoryReader categoryReader;
    private final PostLikeRepository postLikeRepository;
    private final PostFavoriteRepository postFavoriteRepository;
    private final CommentReader commentReader;
    private final PostTagService postTagService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public PostResponse createPost(PostCreateRequest request, Long id) {
        User user = userReader.getActiveUser(id);

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryReader.getOwnedCategory(request.getCategoryId(), user.getId());
        }

        String sanitizedTitle = HtmlSanitizer.sanitizePlainText(request.getTitle());
        String sanitizedDescription = HtmlSanitizer.sanitizePlainText(request.getDescription());
        String sanitizedContent = HtmlSanitizer.sanitizeRichText(request.getContent());
        String sanitizedThumbnailUrl = HtmlSanitizer.sanitizeImageUrl(request.getThumbnailUrl());
        List<String> sanitizedTags = HtmlSanitizer.sanitizeTags(request.getTags());

        Post post = Post.builder()
            .user(user)
            .category(category)
            .title(sanitizedTitle)
            .description(sanitizedDescription)
            .content(sanitizedContent)
            .thumbnailUrl(sanitizedThumbnailUrl)
            .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
            .build();

        Post savedPost = postRepository.save(post);
        List<String> tags = postTagService.syncPostTags(user, savedPost, sanitizedTags);
        eventPublisher.publishEvent(PostGraphSyncEvent.refresh(savedPost.getId()));
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
        return getPostList(type, userId, categoryId, tag, null, pageable, id);
    }

    @Transactional(readOnly = true)
    public Page<PostSummaryResponse> getPostList(
        String type,
        String userId,
        Long categoryId,
        String tag,
        String keyword,
        Pageable pageable,
        Long id) {
        String normalizedType = normalizeType(type);
        String normalizedUserId = normalizeUserId(userId);
        String normalizedTag = normalizeTag(tag);
        String normalizedKeyword = normalizeKeyword(keyword);
        Sort sort = "trending".equals(normalizedType)
            ? Sort.by(
                Sort.Order.desc("likes"),
                Sort.Order.desc("hits"),
                Sort.Order.desc("createdAt"))
            : Sort.by(Sort.Order.desc("createdAt"));
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        Page<Post> posts;
        if ("feed".equals(normalizedType)) {
            posts = id == null
                ? Page.empty(sortedPageable)
                : postRepository.findFollowingFeed(id, normalizedTag, normalizedKeyword, sortedPageable);
        } else if (normalizedKeyword == null) {
            posts = (id != null)
                ? postRepository.findAllVisibleTo(id, normalizedUserId, categoryId, normalizedTag, sortedPageable)
                : postRepository.findAllPublic(normalizedUserId, categoryId, normalizedTag, sortedPageable);
        } else {
            posts = (id != null)
                ? postRepository.findAllVisibleTo(
                    id,
                    normalizedUserId,
                    categoryId,
                    normalizedTag,
                    normalizedKeyword,
                    sortedPageable)
                : postRepository.findAllPublic(
                    normalizedUserId,
                    categoryId,
                    normalizedTag,
                    normalizedKeyword,
                    sortedPageable);
        }

        List<Long> postIds = posts.getContent().stream().map(Post::getId).toList();
        Map<Long, List<String>> tagMap = postTagService.findTagNamesByPostIds(postIds);
        Set<Long> likedPostIds = findLikedPostIds(id, postIds);
        Map<Long, Long> commentCountMap = commentReader.countActiveByPostIds(postIds);

        return posts.map(post -> PostSummaryResponse.from(
            post,
            tagMap.getOrDefault(post.getId(), List.of()),
            likedPostIds.contains(post.getId()),
            commentCountMap.getOrDefault(post.getId(), 0L)));
    }

    private String normalizeType(String type) {
        if (type == null) {
            return "latest";
        }
        String normalizedType = type.trim().toLowerCase(Locale.ROOT);
        if ("trending".equals(normalizedType) || "feed".equals(normalizedType)) {
            return normalizedType;
        }
        return "latest";
    }

    private String normalizeUserId(String userId) {
        return userId == null || userId.isBlank() ? null : userId.trim();
    }

    private String normalizeTag(String tag) {
        return tag == null || tag.isBlank() ? null : tag.trim();
    }

    private String normalizeKeyword(String keyword) {
        return keyword == null || keyword.isBlank() ? null : keyword.trim();
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

        List<String> tags = postTagService.findTagNamesByPostId(postId);
        boolean liked = id != null && postLikeRepository.existsByPost_IdAndUser_Id(postId, id);
        boolean favorited = id != null && postFavoriteRepository.existsByPost_IdAndUser_Id(postId, id);
        return PostResponse.from(post, tags, liked, favorited);
    }

    @Transactional
    public PostResponse updatePost(Long postId, PostUpdateRequest request, Long id) {
        Post post = postRepository.findWithUserById(postId)
            .orElseThrow(PostNotFoundException::new);

        if (!post.getUser().getId().equals(id)) {
            throw new PostUpdateForbiddenException();
        }

        if (request.getCategoryId() != null) {
            Category category = categoryReader.getOwnedCategory(
                request.getCategoryId(),
                post.getUser().getId());
            post.updateCategory(category);
        } else if (request.isCategoryCleared()) {
            post.updateCategory(null);
        }

        String sanitizedTitle = HtmlSanitizer.sanitizePlainText(request.getTitle());
        String sanitizedDescription = HtmlSanitizer.sanitizePlainText(request.getDescription());
        String sanitizedContent = HtmlSanitizer.sanitizeRichText(request.getContent());
        String sanitizedThumbnailUrl = HtmlSanitizer.sanitizeImageUrl(request.getThumbnailUrl());
        List<String> sanitizedTags = HtmlSanitizer.sanitizeTags(request.getTags());

        post.update(
            sanitizedTitle,
            sanitizedDescription,
            sanitizedContent,
            sanitizedThumbnailUrl,
            request.getIsPublic());

        if (request.isThumbnailCleared()) {
            post.clearThumbnail();
        }

        postTagService.replacePostTags(post.getUser(), post, sanitizedTags);

        eventPublisher.publishEvent(PostGraphSyncEvent.refresh(post.getId()));
        eventPublisher.publishEvent(PostGitHubSyncEvent.update(post.getId(), id));
        List<String> tags = postTagService.findTagNamesByPostId(post.getId());
        // 수정 응답으로 상세 화면을 갱신해도 좋아요·즐겨찾기 상태가 풀리지 않도록 함께 내려준다.
        boolean liked = postLikeRepository.existsByPost_IdAndUser_Id(post.getId(), id);
        boolean favorited = postFavoriteRepository.existsByPost_IdAndUser_Id(post.getId(), id);
        return PostResponse.from(post, tags, liked, favorited);
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
        eventPublisher.publishEvent(PostGraphSyncEvent.remove(post.getId()));
        eventPublisher.publishEvent(PostGitHubSyncEvent.delete(postId, postTitle, id));
    }

    // 비로그인이거나 조회 결과가 비면 조회 없이 빈 집합을 돌려준다.
    private Set<Long> findLikedPostIds(Long userId, List<Long> postIds) {
        if (userId == null || postIds.isEmpty()) {
            return Set.of();
        }

        return Set.copyOf(postLikeRepository.findLikedPostIds(userId, postIds));
    }
}

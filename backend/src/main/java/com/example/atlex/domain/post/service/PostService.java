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
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import com.example.atlex.domain.category.exception.CategoryNotFoundException;
import com.example.atlex.domain.post.exception.PostDeleteForbiddenException;
import com.example.atlex.domain.post.exception.PostNotFoundException;
import com.example.atlex.domain.post.exception.PostUpdateForbiddenException;
import com.example.atlex.domain.user.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final GraphIndexService graphIndexService;

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
        graphIndexService.refreshPostGraph(savedPost.getId());

        return PostResponse.from(savedPost);
    }

    @Transactional(readOnly = true)
    public Page<PostSummaryResponse> getPostList(
        String type,
        String userId,
        Long categoryId,
        Pageable pageable,
        Long id) {
        String normalizedType = normalizeType(type);
        String normalizedUserId = normalizeUserId(userId);
        Sort sort = "trending".equals(normalizedType)
            ? Sort.by(
                Sort.Order.desc("likes"),
                Sort.Order.desc("hits"),
                Sort.Order.desc("createdAt"))
            : Sort.by(Sort.Order.desc("createdAt"));
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        if (id != null) {
            return postRepository.findAllVisibleTo(
                id,
                normalizedUserId,
                categoryId,
                sortedPageable).map(PostSummaryResponse::from);
        }
        return postRepository.findAllPublic(
            normalizedUserId,
            categoryId,
            sortedPageable).map(PostSummaryResponse::from);
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

    @Transactional(readOnly = true)
    public PostResponse getPost(Long postId, Long id) {
        Post post = postRepository.findWithUserById(postId)
            .orElseThrow(PostNotFoundException::new);

        // 조회에서는 비공개 글 존재 여부를 숨기기 위해 작성자가 아니면 404로 응답한다.
        // 수정/삭제는 권한 위반을 명확히 표현하기 위해 403 정책을 유지한다.
        if (!Boolean.TRUE.equals(post.getIsPublic()) && !Objects.equals(post.getUser().getId(), id)) {
            throw new PostNotFoundException();
        }

        return PostResponse.from(post);
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
        graphIndexService.refreshPostGraph(post.getId());
        return PostResponse.from(post);
    }

    @Transactional
    public void deletePost(Long postId, Long id) {
        Post post = postRepository.findWithUserById(postId)
            .orElseThrow(PostNotFoundException::new);

        if (!post.getUser().getId().equals(id)) {
            throw new PostDeleteForbiddenException();
        }

        post.softDelete();
        graphIndexService.removePostGraph(post.getId());
    }
}

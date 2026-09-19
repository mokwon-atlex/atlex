package com.example.atlex.domain.post.service;

import com.example.atlex.domain.post.dto.response.PostFavoriteResponse;
import com.example.atlex.domain.post.dto.response.PostSummaryResponse;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.entity.PostFavorite;
import com.example.atlex.domain.post.repository.PostFavoriteRepository;
import com.example.atlex.domain.tag.repository.PostTagRepository;
import com.example.atlex.domain.tag.repository.projection.PostTagNameProjection;
import com.example.atlex.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PostFavoriteService {

    private final PostFavoriteRepository postFavoriteRepository;
    private final UserRepository userRepository;
    private final PostAccessService postAccessService;
    private final PostTagRepository postTagRepository;

    @Transactional
    public PostFavoriteResponse addFavorite(Long postId, Long userId) {
        Post post = postAccessService.getAccessiblePost(postId, userId);

        // 이미 즐겨찾기한 경우 멱등하게 현재 상태를 반환한다.
        if (postFavoriteRepository.existsByPost_IdAndUser_Id(postId, userId)) {
            return PostFavoriteResponse.of(postId, true);
        }

        try {
            postFavoriteRepository.saveAndFlush(PostFavorite.builder()
                .post(post)
                .user(userRepository.getReferenceById(userId))
                .build());
        } catch (DataIntegrityViolationException e) {
            // 동시 요청으로 (user_id, post_id) unique 제약을 동시에 위반한 경우 멱등하게 흡수한다.
            return PostFavoriteResponse.of(postId, true);
        }

        return PostFavoriteResponse.of(postId, true);
    }

    @Transactional
    public PostFavoriteResponse removeFavorite(Long postId, Long userId) {
        postAccessService.getAccessiblePost(postId, userId);

        // 즐겨찾기하지 않은 상태에서 해제해도 에러 없이 멱등하게 처리한다.
        postFavoriteRepository.deleteByPostIdAndUserId(postId, userId);
        return PostFavoriteResponse.of(postId, false);
    }

    @Transactional(readOnly = true)
    public Page<PostSummaryResponse> getMyFavorites(Long userId, Pageable pageable) {
        // 최근 즐겨찾기한 순으로 정렬한다(같은 시각이면 id로 안정 정렬).
        Sort sort = Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        Page<PostFavorite> favorites = postFavoriteRepository.findFavoritesByUserId(userId, sortedPageable);
        List<Long> postIds = favorites.getContent().stream()
            .map(favorite -> favorite.getPost().getId())
            .toList();
        Map<Long, List<String>> tagMap = findTagNamesByPostIds(postIds);

        return favorites.map(favorite -> PostSummaryResponse.from(
            favorite.getPost(),
            tagMap.getOrDefault(favorite.getPost().getId(), List.of())));
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

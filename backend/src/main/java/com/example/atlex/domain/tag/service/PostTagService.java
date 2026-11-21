package com.example.atlex.domain.tag.service;

import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.tag.entity.PostTag;
import com.example.atlex.domain.tag.entity.Tag;
import com.example.atlex.domain.tag.repository.PostTagRepository;
import com.example.atlex.domain.tag.repository.projection.PostTagNameProjection;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.global.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * 게시글과 태그 간 연관관계(생성·교체·조회)를 관리하는 서비스입니다.
 */
@Service
@RequiredArgsConstructor
public class PostTagService {

    private static final int MAX_TAGS_PER_POST = 10;

    private final PostTagRepository postTagRepository;
    private final TagService tagService;

    /**
     * 게시글에 태그 목록을 정규화·중복 제거하여 연결합니다.
     *
     * @param user 작성자 엔티티
     * @param post 게시글 엔티티
     * @param rawTags 입력 태그 문자열 목록
     * @return 저장된 정규화 태그명 목록
     */
    @Transactional
    public List<String> syncPostTags(User user, Post post, List<String> rawTags) {
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

        if (normalizedTags.size() > MAX_TAGS_PER_POST) {
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

    /**
     * 게시글의 기존 태그 연결을 모두 제거하고 새 태그 목록으로 교체합니다.
     *
     * @param user 작성자 엔티티
     * @param post 게시글 엔티티
     * @param rawTags 새 태그 문자열 목록 (null이면 변경하지 않음)
     */
    @Transactional
    public void replacePostTags(User user, Post post, List<String> rawTags) {
        if (rawTags == null) {
            return;
        }
        postTagRepository.deleteByPostId(post.getId());
        syncPostTags(user, post, rawTags);
    }

    /**
     * 단일 게시글에 연결된 태그명 목록을 조회합니다.
     *
     * @param postId 게시글 ID
     * @return 태그명 목록
     */
    @Transactional(readOnly = true)
    public List<String> findTagNamesByPostId(Long postId) {
        return postTagRepository.findTagNamesByPostId(postId);
    }

    /**
     * 여러 게시글 ID에 대한 태그명 목록을 일괄 조회합니다.
     *
     * @param postIds 게시글 ID 목록
     * @return 게시글 ID별 태그명 목록 맵
     */
    @Transactional(readOnly = true)
    public Map<Long, List<String>> findTagNamesByPostIds(List<Long> postIds) {
        if (postIds == null || postIds.isEmpty()) {
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

package com.example.atlex.domain.tag.service;

import com.example.atlex.domain.tag.dto.response.PlatformTagItemResponse;
import com.example.atlex.domain.tag.dto.response.TagListItemResponse;
import com.example.atlex.domain.tag.dto.response.TagListResponse;
import com.example.atlex.domain.tag.entity.Tag;
import com.example.atlex.domain.tag.repository.PostTagRepository;
import com.example.atlex.domain.tag.repository.TagRepository;
import com.example.atlex.domain.tag.repository.projection.PlatformTagProjection;
import org.springframework.data.domain.Page;
import com.example.atlex.domain.tag.repository.projection.TagPostCountProjection;
import com.example.atlex.domain.tag.repository.projection.TagThumbnailProjection;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import com.example.atlex.domain.user.exception.UserNotFoundException;
import com.example.atlex.global.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {

    private static final int DEFAULT_LIMIT = 10;
    private static final int MAX_LIMIT = 50;
    /** 트렌딩 정렬에서 최근 글 수를 집계하는 기간(일) */
    private static final int TRENDING_PERIOD_DAYS = 30;

    private final PostTagRepository postTagRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    /** 트렌딩 집계 기준 시각을 계산하는 시계 */
    private final Clock clock;

    @Transactional(readOnly = true)
    public TagListResponse getTags(
        String userId,
        Integer limit,
        Long cursor,
        Long loginUserId) {
        User owner = findActiveUser(userId);
        int effectiveLimit = normalizeLimit(limit);
        validateCursor(cursor);
        boolean isOwner = owner.getId().equals(loginUserId);

        List<Tag> fetched = postTagRepository.findTagPage(
            owner.getId(),
            cursor,
            isOwner,
            PageRequest.of(0, effectiveLimit + 1));

        boolean hasNext = fetched.size() > effectiveLimit;
        List<Tag> tags = hasNext
            ? List.copyOf(fetched.subList(0, effectiveLimit))
            : fetched;

        if (tags.isEmpty()) {
            return TagListResponse.builder()
                .content(List.of())
                .hasNext(false)
                .hasLast(true)
                .nextCursor(null)
                .build();
        }

        List<Long> tagIds = tags.stream()
            .map(Tag::getId)
            .toList();

        Map<Long, Long> postCounts = postTagRepository
            .countPostsByTagIds(tagIds, owner.getId(), isOwner)
            .stream()
            .collect(Collectors.toMap(
                TagPostCountProjection::getTagId,
                TagPostCountProjection::getPostCount));

        Map<Long, String> thumbnails = postTagRepository
            .findLatestThumbnailsByTagIds(tagIds, owner.getId(), isOwner)
            .stream()
            .collect(Collectors.toMap(
                TagThumbnailProjection::getTagId,
                TagThumbnailProjection::getThumbnailUrl));

        List<TagListItemResponse> content = tags.stream()
            .map(tag -> TagListItemResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .postCount(postCounts.getOrDefault(tag.getId(), 0L))
                .thumbnailUrl(thumbnails.get(tag.getId()))
                .build())
            .toList();

        return TagListResponse.builder()
            .content(content)
            .hasNext(hasNext)
            .hasLast(!hasNext)
            .nextCursor(hasNext ? tags.get(tags.size() - 1).getId() : null)
            .build();
    }

    /**
     * 플랫폼 전체 공개 태그 목록을 정렬 및 검색 조건에 따라 페이징 조회합니다.
     * trending은 최근 30일 글 수, popular는 전체 글 수, alphabet은 태그명 기준이며 알 수 없는 값은 popular로 처리합니다.
     *
     * @param sort 정렬 기준 (popular, alphabet, trending)
     * @param keyword 태그 검색 키워드
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지당 개수
     * @return 태그 페이징 결과
     */
    @Transactional(readOnly = true)
    public Page<PlatformTagItemResponse> getAllTags(
        String sort,
        String keyword,
        int page,
        int size) {
        String normalizedKeyword = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        int safePage = Math.max(0, page);
        int safeSize = (size <= 0 || size > 100) ? 12 : size;
        PageRequest pageRequest = PageRequest.of(safePage, safeSize);

        Page<PlatformTagProjection> result;
        if ("alphabet".equalsIgnoreCase(sort)) {
            result = postTagRepository.findPlatformTagsAlphabet(normalizedKeyword, pageRequest);
        } else if ("trending".equalsIgnoreCase(sort)) {
            LocalDateTime since = LocalDateTime.now(clock).minusDays(TRENDING_PERIOD_DAYS);
            result = postTagRepository.findPlatformTagsTrending(normalizedKeyword, since, pageRequest);
        } else {
            result = postTagRepository.findPlatformTagsPopular(normalizedKeyword, pageRequest);
        }

        return result.map(p -> PlatformTagItemResponse.builder()
            .name(p.getName())
            .postCount(p.getPostCount() != null ? p.getPostCount() : 0L)
            .build());
    }

    private User findActiveUser(String userId) {
        return userRepository.findByUserIdAndActiveTrue(userId)
            .orElseThrow(UserNotFoundException::new);
    }

    private int normalizeLimit(Integer limit) {
        int requestedLimit = limit == null ? DEFAULT_LIMIT : limit;
        if (requestedLimit <= 0) {
            throw new ValidationException();
        }
        return Math.min(requestedLimit, MAX_LIMIT);
    }

    private void validateCursor(Long cursor) {
        if (cursor != null && cursor <= 0) {
            throw new ValidationException();
        }
    }

    /**
     * 태그명으로 태그를 조회하고, 없으면 새로 생성합니다.
     * 동시성 경합으로 인한 유니크 제약 위반 시 재조회하여 원자적으로 반환합니다.
     *
     * @param tagName 태그명
     * @return 조회되거나 생성된 Tag 엔티티
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Tag getOrCreateTag(String tagName) {
        return tagRepository.findByNameIgnoreCase(tagName)
            .orElseGet(() -> {
                try {
                    return tagRepository.saveAndFlush(Tag.of(tagName));
                } catch (DataIntegrityViolationException e) {
                    return tagRepository.findByNameIgnoreCase(tagName)
                        .orElseThrow(() -> e);
                }
            });
    }
}

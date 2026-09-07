package com.example.atlex.domain.tag.service;

import com.example.atlex.domain.tag.dto.response.TagListItemResponse;
import com.example.atlex.domain.tag.dto.response.TagListResponse;
import com.example.atlex.domain.tag.entity.Tag;
import com.example.atlex.domain.tag.repository.PostTagRepository;
import com.example.atlex.domain.tag.repository.projection.TagPostCountProjection;
import com.example.atlex.domain.tag.repository.projection.TagThumbnailProjection;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import com.example.atlex.domain.user.exception.UserNotFoundException;
import com.example.atlex.global.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {

    private static final int DEFAULT_LIMIT = 10;
    private static final int MAX_LIMIT = 50;

    private final PostTagRepository postTagRepository;
    private final UserRepository userRepository;

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
}

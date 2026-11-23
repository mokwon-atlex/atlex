package com.example.atlex.domain.post.service;

import com.example.atlex.domain.category.repository.projection.CategoryPostCountProjection;
import com.example.atlex.domain.category.repository.projection.CategoryThumbnailProjection;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 다른 도메인에서 게시글 통계·메타데이터를 조회할 때 사용하는 공개 조회 경계입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostReader {

    private final PostRepository postRepository;

    /**
     * 카테고리 ID 목록별 게시글 수를 조회합니다.
     *
     * @param categoryIds 카테고리 ID 목록
     * @param ownerView 블로그 소유자 본인 조회 여부
     * @return 카테고리 ID별 게시글 수 맵
     */
    public Map<Long, Long> countPostsByCategoryIds(List<Long> categoryIds, boolean ownerView) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return Map.of();
        }
        return postRepository.countPostsByCategoryIds(categoryIds, ownerView)
            .stream()
            .collect(Collectors.toMap(
                CategoryPostCountProjection::getCategoryId,
                CategoryPostCountProjection::getPostCount));
    }

    /**
     * 카테고리 ID 목록별 최신 게시글 썸네일 URL을 조회합니다.
     *
     * @param categoryIds 카테고리 ID 목록
     * @param ownerView 블로그 소유자 본인 조회 여부
     * @return 카테고리 ID별 최신 썸네일 URL 맵
     */
    public Map<Long, String> findLatestThumbnailsByCategoryIds(List<Long> categoryIds, boolean ownerView) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return Map.of();
        }
        return postRepository.findLatestThumbnailsByCategoryIds(categoryIds, ownerView)
            .stream()
            .collect(Collectors.toMap(
                CategoryThumbnailProjection::getCategoryId,
                CategoryThumbnailProjection::getThumbnailUrl));
    }

    /**
     * 사용자의 활성 게시글 수를 조회합니다.
     *
     * @param userId 사용자 PK
     * @param ownerView 본인 조회 여부 (false면 공개 글만 집계)
     * @return 게시글 수
     */
    public long countUserPosts(Long userId, boolean ownerView) {
        return ownerView
            ? postRepository.countByUser_IdAndIsDeletedFalse(userId)
            : postRepository.countByUser_IdAndIsDeletedFalseAndIsPublicTrue(userId);
    }

    /**
     * ID로 게시글을 조회합니다 (삭제 여부 무관, 관리자 등 특수 조회용).
     *
     * @param postId 게시글 ID
     * @return 게시글 Optional
     */
    public Optional<Post> findById(Long postId) {
        return postRepository.findById(postId);
    }

    /**
     * FK 연결 전용 게시글 프록시 참조를 반환합니다.
     *
     * @param postId 게시글 ID
     * @return 게시글 엔티티 프록시
     */
    public Post getReferenceById(Long postId) {
        return postRepository.getReferenceById(postId);
    }

    /**
     * 작성자와 카테고리 정보를 함께 포함한 활성 게시글을 조회합니다.
     *
     * @param postId 게시글 ID
     * @return 게시글 Optional
     */
    public Optional<Post> findWithUserById(Long postId) {
        return postRepository.findWithUserById(postId);
    }

    /**
     * 삭제되지 않은 전체 공개 게시글 수를 조회합니다.
     *
     * @return 공개 게시글 수
     */
    public long countPublicPosts() {
        return postRepository.countByIsDeletedFalseAndIsPublicTrue();
    }

    /**
     * 지식 그래프 인덱싱 대상이 되는 전체 공개 게시글 목록을 조회합니다.
     *
     * @return 공개 게시글 목록
     */
    public List<Post> findAllPublicGraphSourcePosts() {
        return postRepository.findAllPublicGraphSourcePosts();
    }

    /**
     * 그래프 화면에서 조회자에게 노출 가능한 게시글 목록을 조회합니다.
     *
     * @param viewerId 조회자 PK (비로그인이면 null)
     * @param userId 작성자 로그인 아이디 필터 (null이면 전체)
     * @param categoryId 카테고리 ID 필터 (null이면 전체)
     * @return 노출 가능한 게시글 목록
     */
    public List<Post> findGraphVisiblePosts(Long viewerId, String userId, Long categoryId) {
        return postRepository.findGraphVisiblePosts(viewerId, userId, categoryId);
    }
}

package com.example.atlex.domain.post.repository;

import com.example.atlex.domain.follow.entity.Follow;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.tag.entity.PostTag;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * 게시글 목록 조회의 동적 필터 조건(공개 범위·팔로잉 피드·작성자·카테고리·태그·키워드)을 조합하는 JPA Specification 모음입니다.
 */
public final class PostSpecifications {

    private PostSpecifications() {}

    /**
     * 목록 조회 조건에 맞는 게시글 검색 Specification을 생성합니다.
     *
     * @param type 목록 유형 (latest, trending, feed)
     * @param viewerId 조회자 PK (비로그인이면 null)
     * @param authorUserId 작성자 로그인 아이디 필터 (null이면 전체)
     * @param categoryId 카테고리 ID 필터 (null이면 전체)
     * @param tag 태그명 필터 (null이면 전체)
     * @param keyword 검색 키워드 (null이면 전체)
     * @return 조합된 Specification
     */
    public static Specification<Post> search(
        String type,
        Long viewerId,
        String authorUserId,
        Long categoryId,
        String tag,
        String keyword) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if ("feed".equals(type)) {
                predicates.add(cb.isTrue(root.get("isPublic")));
                predicates.add(followingAuthor(root, query, cb, viewerId));
            } else if (viewerId != null) {
                predicates.add(cb.or(
                    cb.isTrue(root.get("isPublic")),
                    cb.equal(root.get("user").get("id"), viewerId)));
            } else {
                predicates.add(cb.isTrue(root.get("isPublic")));
            }

            if (authorUserId != null) {
                predicates.add(cb.equal(root.get("user").get("userId"), authorUserId));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (tag != null) {
                predicates.add(hasTag(root, query, cb, tag));
            }
            if (keyword != null) {
                predicates.add(matchesKeyword(root, query, cb, keyword));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static Predicate followingAuthor(
        Root<Post> root,
        CriteriaQuery<?> query,
        CriteriaBuilder cb,
        Long viewerId) {
        Subquery<Long> subquery = query.subquery(Long.class);
        Root<Follow> follow = subquery.from(Follow.class);
        subquery.select(follow.get("id"))
            .where(
                cb.equal(follow.get("follower").get("id"), viewerId),
                cb.equal(follow.get("following"), root.get("user")));
        return cb.exists(subquery);
    }

    private static Predicate hasTag(
        Root<Post> root,
        CriteriaQuery<?> query,
        CriteriaBuilder cb,
        String tag) {
        Subquery<Long> subquery = query.subquery(Long.class);
        Root<PostTag> postTag = subquery.from(PostTag.class);
        subquery.select(postTag.get("id"))
            .where(
                cb.equal(postTag.get("post"), root),
                cb.equal(cb.lower(postTag.get("tag").get("name")), tag.toLowerCase(Locale.ROOT)));
        return cb.exists(subquery);
    }

    private static Predicate matchesKeyword(
        Root<Post> root,
        CriteriaQuery<?> query,
        CriteriaBuilder cb,
        String keyword) {
        String pattern = "%" + keyword.toLowerCase(Locale.ROOT) + "%";
        var userJoin = root.join("user", JoinType.INNER);

        Subquery<Long> tagSubquery = query.subquery(Long.class);
        Root<PostTag> postTag = tagSubquery.from(PostTag.class);
        tagSubquery.select(postTag.get("id"))
            .where(
                cb.equal(postTag.get("post"), root),
                cb.like(cb.lower(postTag.get("tag").get("name")), pattern));

        return cb.or(
            cb.like(cb.lower(root.get("title")), pattern),
            cb.like(cb.lower(cb.coalesce(root.get("description"), "")), pattern),
            cb.like(cb.lower(root.get("content")), pattern),
            cb.like(cb.lower(userJoin.get("name")), pattern),
            cb.like(cb.lower(userJoin.get("userId")), pattern),
            cb.exists(tagSubquery));
    }
}

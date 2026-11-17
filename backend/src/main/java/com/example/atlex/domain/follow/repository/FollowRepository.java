package com.example.atlex.domain.follow.repository;

import com.example.atlex.domain.follow.entity.Follow;
import com.example.atlex.domain.user.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 팔로우 관계 조회 및 저장을 담당하는 리포지토리.
 */
public interface FollowRepository extends JpaRepository<Follow, Long> {

    boolean existsByFollowerAndFollowing(User follower, User following);

    long countByFollowingId(Long followingId);

    long countByFollowerId(Long followerId);

    void deleteByFollowerAndFollowing(User follower, User following);

    @EntityGraph(attributePaths = {"follower"})
    List<Follow> findAllByFollowingIdOrderByCreatedAtDesc(Long followingId);

    @EntityGraph(attributePaths = {"following"})
    List<Follow> findAllByFollowerIdOrderByCreatedAtDesc(Long followerId);
}

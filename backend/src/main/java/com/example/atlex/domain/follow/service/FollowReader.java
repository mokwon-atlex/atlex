package com.example.atlex.domain.follow.service;

import com.example.atlex.domain.follow.repository.FollowRepository;
import com.example.atlex.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * 다른 도메인에서 팔로우 관계·카운트를 조회할 때 사용하는 공개 조회 경계입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FollowReader {

    private final FollowRepository followRepository;

    /**
     * 특정 사용자의 팔로워 수를 조회합니다.
     *
     * @param userId 대상 사용자 PK
     * @return 팔로워 수
     */
    public long countFollowers(Long userId) {
        return followRepository.countByFollowingId(userId);
    }

    /**
     * 특정 사용자의 팔로잉 수를 조회합니다.
     *
     * @param userId 대상 사용자 PK
     * @return 팔로잉 수
     */
    public long countFollowing(Long userId) {
        return followRepository.countByFollowerId(userId);
    }

    /**
     * 팔로워가 대상 사용자를 팔로우 중인지 확인합니다.
     *
     * @param follower 팔로우 주체 사용자
     * @param following 팔로우 대상 사용자
     * @return 팔로우 여부
     */
    public boolean isFollowing(User follower, User following) {
        return followRepository.existsByFollowerAndFollowing(follower, following);
    }

    /**
     * 사용자가 팔로우 중인 대상 사용자 PK 집합을 조회합니다.
     *
     * @param followerId 팔로워 사용자 PK
     * @return 팔로잉 사용자 PK 집합
     */
    public Set<Long> findFollowingUserIds(Long followerId) {
        return followRepository.findAllByFollowerIdOrderByCreatedAtDesc(followerId).stream()
            .map(follow -> follow.getFollowing().getId())
            .collect(Collectors.toSet());
    }
}

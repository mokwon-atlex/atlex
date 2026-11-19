package com.example.atlex.domain.follow.service;

import com.example.atlex.domain.auth.exception.AuthenticationException;
import com.example.atlex.domain.follow.dto.response.FollowStatusResponse;
import com.example.atlex.domain.follow.dto.response.FollowUserResponse;
import com.example.atlex.domain.follow.entity.Follow;
import com.example.atlex.domain.follow.event.UserFollowedEvent;
import com.example.atlex.domain.follow.exception.SelfFollowNotAllowedException;
import com.example.atlex.domain.follow.repository.FollowRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.exception.UserNotFoundException;
import com.example.atlex.domain.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 사용자 간 팔로우 등록·해제 및 팔로워/팔로잉 목록 조회 비즈니스 로직을 처리한다.
 */
@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public FollowStatusResponse follow(String targetUserId, User loginUser) {
        if (loginUser == null) {
            throw new AuthenticationException();
        }
        User targetUser = findActiveUser(targetUserId);
        if (targetUser.getId().equals(loginUser.getId())) {
            throw new SelfFollowNotAllowedException();
        }

        if (!followRepository.existsByFollowerAndFollowing(loginUser, targetUser)) {
            followRepository.save(Follow.builder().follower(loginUser).following(targetUser).build());
            eventPublisher.publishEvent(new UserFollowedEvent(loginUser.getId(), targetUser.getId()));
        }

        return buildStatusResponse(targetUser, true);
    }

    @Transactional
    public FollowStatusResponse unfollow(String targetUserId, User loginUser) {
        if (loginUser == null) {
            throw new AuthenticationException();
        }
        User targetUser = findActiveUser(targetUserId);
        if (targetUser.getId().equals(loginUser.getId())) {
            throw new SelfFollowNotAllowedException();
        }

        followRepository.deleteByFollowerAndFollowing(loginUser, targetUser);
        return buildStatusResponse(targetUser, false);
    }

    @Transactional(readOnly = true)
    public List<FollowUserResponse> getFollowers(String targetUserId) {
        User targetUser = findActiveUser(targetUserId);
        return followRepository.findAllByFollowingIdOrderByCreatedAtDesc(targetUser.getId()).stream()
            .map(follow -> FollowUserResponse.from(follow.getFollower()))
            .filter(user -> user != null)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<FollowUserResponse> getFollowing(String targetUserId) {
        User targetUser = findActiveUser(targetUserId);
        return followRepository.findAllByFollowerIdOrderByCreatedAtDesc(targetUser.getId()).stream()
            .map(follow -> FollowUserResponse.from(follow.getFollowing()))
            .filter(user -> user != null)
            .toList();
    }

    private User findActiveUser(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new UserNotFoundException();
        }
        return userRepository.findByUserIdAndActiveTrue(userId).orElseThrow(UserNotFoundException::new);
    }

    private FollowStatusResponse buildStatusResponse(User targetUser, boolean following) {
        return FollowStatusResponse.builder()
            .userId(targetUser.getUserId())
            .following(following)
            .followerCount(followRepository.countByFollowingId(targetUser.getId()))
            .followingCount(followRepository.countByFollowerId(targetUser.getId()))
            .build();
    }
}

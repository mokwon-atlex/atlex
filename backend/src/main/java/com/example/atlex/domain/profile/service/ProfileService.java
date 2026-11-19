package com.example.atlex.domain.profile.service;

import com.example.atlex.domain.follow.repository.FollowRepository;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.profile.dto.request.ProfileUpdateRequest;
import com.example.atlex.domain.profile.dto.response.PublicUserResponse;
import com.example.atlex.domain.user.entity.BlogSkin;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import com.example.atlex.domain.user.exception.UserNotFoundException;
import com.example.atlex.global.exception.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final FollowRepository followRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PublicUserResponse getPublicProfile(String userId) {
        return getPublicProfile(userId, null);
    }

    @Transactional(readOnly = true)
    public PublicUserResponse getPublicProfile(String userId, User loginUser) {
        if (userId == null || userId.isBlank()) {
            throw new UserNotFoundException();
        }
        User user = userRepository.findByUserIdAndActiveTrue(userId)
            .orElseThrow(UserNotFoundException::new);
        long followerCount = followRepository.countByFollowingId(user.getId());
        long followingCount = followRepository.countByFollowerId(user.getId());
        boolean isOwner = loginUser != null && user.getId().equals(loginUser.getId());
        long postCount = isOwner
            ? postRepository.countByUser_IdAndIsDeletedFalse(user.getId())
            : postRepository.countByUser_IdAndIsDeletedFalseAndIsPublicTrue(user.getId());
        boolean following = loginUser != null
            && !loginUser.getId().equals(user.getId())
            && followRepository.existsByFollowerAndFollowing(loginUser, user);
        return PublicUserResponse.from(user, followerCount, followingCount, following, postCount);
    }

    @Transactional
    public PublicUserResponse updatePublicProfile(String userId, ProfileUpdateRequest request, User loginUser) {
        if (userId == null || userId.isBlank()) {
            throw new UserNotFoundException();
        }

        User user = userRepository.findByUserIdAndActiveTrue(userId)
            .orElseThrow(UserNotFoundException::new);

        if (loginUser == null || !user.getId().equals(loginUser.getId())) {
            throw new AccessDeniedException();
        }

        user.updateProfile(
            request.getName() != null ? request.getName().trim() : null,
            request.getProfileImage(),
            request.getInfo());
        if (request.getBlogSkin() != null) {
            user.updateBlogSkin(BlogSkin.valueOf(request.getBlogSkin()));
        }

        long followerCount = followRepository.countByFollowingId(user.getId());
        long followingCount = followRepository.countByFollowerId(user.getId());
        long postCount = postRepository.countByUser_IdAndIsDeletedFalse(user.getId());
        return PublicUserResponse.from(user, followerCount, followingCount, false, postCount);
    }
}

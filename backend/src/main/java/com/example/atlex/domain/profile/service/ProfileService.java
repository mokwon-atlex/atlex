package com.example.atlex.domain.profile.service;

import com.example.atlex.domain.follow.service.FollowReader;
import com.example.atlex.domain.post.service.PostReader;
import com.example.atlex.domain.profile.dto.request.ProfileUpdateRequest;
import com.example.atlex.domain.profile.dto.response.PublicUserResponse;
import com.example.atlex.domain.user.entity.BlogSkin;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.service.UserReader;
import com.example.atlex.global.exception.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final FollowReader followReader;
    private final PostReader postReader;
    private final UserReader userReader;

    @Transactional(readOnly = true)
    public PublicUserResponse getPublicProfile(String userId) {
        return getPublicProfile(userId, null);
    }

    @Transactional(readOnly = true)
    public PublicUserResponse getPublicProfile(String userId, User loginUser) {
        User user = userReader.getActiveUserByUserId(userId);
        long followerCount = followReader.countFollowers(user.getId());
        long followingCount = followReader.countFollowing(user.getId());
        boolean isOwner = loginUser != null && user.getId().equals(loginUser.getId());
        long postCount = postReader.countUserPosts(user.getId(), isOwner);
        boolean following = loginUser != null
            && !loginUser.getId().equals(user.getId())
            && followReader.isFollowing(loginUser, user);
        return PublicUserResponse.from(user, followerCount, followingCount, following, postCount);
    }

    @Transactional
    public PublicUserResponse updatePublicProfile(String userId, ProfileUpdateRequest request, User loginUser) {
        User user = userReader.getActiveUserByUserId(userId);

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

        long followerCount = followReader.countFollowers(user.getId());
        long followingCount = followReader.countFollowing(user.getId());
        long postCount = postReader.countUserPosts(user.getId(), true);
        return PublicUserResponse.from(user, followerCount, followingCount, false, postCount);
    }
}

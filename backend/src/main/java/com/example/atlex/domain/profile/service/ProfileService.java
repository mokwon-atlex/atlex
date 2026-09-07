package com.example.atlex.domain.profile.service;

import com.example.atlex.domain.profile.dto.request.ProfileUpdateRequest;
import com.example.atlex.domain.profile.dto.response.PublicUserResponse;
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

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PublicUserResponse getPublicProfile(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new UserNotFoundException();
        }
        User user = userRepository.findByUserIdAndActiveTrue(userId)
                .orElseThrow(UserNotFoundException::new);
        return PublicUserResponse.from(user);
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
                request.getInfo()
        );

        return PublicUserResponse.from(user);
    }
}

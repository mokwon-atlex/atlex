package com.example.atlex.domain.user.service;

import com.example.atlex.domain.auth.repository.RefreshTokenRepository;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import com.example.atlex.domain.user.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDeletionService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public void delete(String userId) {
        User user = userRepository.findByUserIdAndActiveTrue(userId)
                .orElseThrow(UserNotFoundException::new);

        Long id = user.getId();
        user.deactivate();
        postRepository.softDeleteAllByUserId(id);
        if (refreshTokenRepository.existsById(id)) {
            refreshTokenRepository.deleteById(id);
        }
    }
}

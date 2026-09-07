package com.example.atlex.domain.user.service;

import com.example.atlex.domain.user.dto.request.SignupRequest;
import com.example.atlex.domain.user.dto.request.UpdateRequest;
import com.example.atlex.domain.user.dto.request.ChangePasswordRequest;
import com.example.atlex.domain.user.dto.response.UserResponse;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import com.example.atlex.domain.user.exception.DuplicateEmailException;
import com.example.atlex.domain.user.exception.DuplicateUserIdException;
import com.example.atlex.domain.user.exception.InvalidCurrentPasswordException;
import com.example.atlex.domain.user.exception.PrivacyNotAgreedException;
import com.example.atlex.domain.user.exception.SameAsCurrentPasswordException;
import com.example.atlex.domain.user.exception.TermsNotAgreedException;
import com.example.atlex.domain.user.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse signUp(SignupRequest request) {
        String cleanUserId = request.getUserId().trim();
        String cleanEmail = request.getEmail().trim();
        String cleanName = request.getName().trim();
        String cleanPassword = request.getPassword().trim();

        if (!Boolean.TRUE.equals(request.getTermsAgreed())) {
            throw new TermsNotAgreedException();
        }
        if (!Boolean.TRUE.equals(request.getPrivacyAgreed())) {
            throw new PrivacyNotAgreedException();
        }

        if (userRepository.existsByUserId(cleanUserId)) {
            throw new DuplicateUserIdException();
        }

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new DuplicateEmailException();
        }

        User user = User.builder()
                .userId(cleanUserId)
                .email(cleanEmail)
                .password(passwordEncoder.encode(cleanPassword))
                .name(cleanName)
                .termsAgreed(request.getTermsAgreed())
                .privacyAgreed(request.getPrivacyAgreed())
                .marketingAgreed(Boolean.TRUE.equals(request.getMarketingAgreed()))
                .agreedAt(LocalDateTime.now())
                .build();

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserResponse findByUserId(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(UserNotFoundException::new);
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public void checkEmailDuplicate(String email) {
        String cleanEmail = email.trim();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new DuplicateEmailException();
        }
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse update(String userId, UpdateRequest request) {
        User user = userRepository.findByUserIdAndActiveTrue(userId)
                .orElseThrow(UserNotFoundException::new);

        if (request.getUserId() != null) {
            String cleanUserId = request.getUserId().trim();
            if (!cleanUserId.equals(user.getUserId()) && userRepository.existsByUserId(cleanUserId)) {
                throw new DuplicateUserIdException();
            }
            request.setUserId(cleanUserId);
        }

        if (request.getEmail() != null) {
            String cleanEmail = request.getEmail().trim();
            if (!cleanEmail.equals(user.getEmail()) && userRepository.existsByEmail(cleanEmail)) {
                throw new DuplicateEmailException();
            }
            request.setEmail(cleanEmail);
        }

        user.update(
                request.getUserId(),
                request.getEmail(),
                request.getName() != null ? request.getName().trim() : null
        );

        return UserResponse.from(user);
    }

    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = userRepository.findByUserIdAndActiveTrue(userId)
                .orElseThrow(UserNotFoundException::new);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidCurrentPasswordException();
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new SameAsCurrentPasswordException();
        }

        user.changePassword(passwordEncoder.encode(request.getNewPassword()));
    }
}

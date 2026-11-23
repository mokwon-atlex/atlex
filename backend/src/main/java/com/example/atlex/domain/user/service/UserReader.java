package com.example.atlex.domain.user.service;

import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.exception.DuplicateEmailException;
import com.example.atlex.domain.user.exception.DuplicateNameException;
import com.example.atlex.domain.user.exception.DuplicateUserIdException;
import com.example.atlex.domain.user.exception.PrivacyNotAgreedException;
import com.example.atlex.domain.user.exception.TermsNotAgreedException;
import com.example.atlex.domain.user.exception.UserNotFoundException;
import com.example.atlex.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 다른 도메인에서 활성 사용자 엔티티를 조회할 때 사용하는 공개 조회 경계입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserReader {

    private final UserRepository userRepository;

    /**
     * PK 기준으로 활성 사용자를 조회합니다.
     *
     * @param id 사용자 PK
     * @return 활성 사용자 엔티티
     */
    public User getActiveUser(Long id) {
        return userRepository.findByIdAndActiveTrue(id)
            .orElseThrow(UserNotFoundException::new);
    }

    /**
     * 로그인 아이디 기준으로 활성 사용자를 조회합니다.
     *
     * @param userId 사용자 로그인 아이디
     * @return 활성 사용자 엔티티
     */
    public User getActiveUserByUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new UserNotFoundException();
        }
        return userRepository.findByUserIdAndActiveTrue(userId)
            .orElseThrow(UserNotFoundException::new);
    }

    /**
     * FK 연결 전용 사용자 프록시 참조를 반환합니다.
     *
     * @param id 사용자 PK
     * @return 사용자 엔티티 프록시
     */
    public User getReferenceById(Long id) {
        return userRepository.getReferenceById(id);
    }

    /**
     * 전체 활성 사용자 목록을 조회합니다.
     *
     * @return 활성 사용자 목록
     */
    public List<User> findAllActiveUsers() {
        return userRepository.findAllByActiveTrue();
    }

    /**
     * 로그인 인증용으로 아이디 기준 사용자를 조회합니다(비활성 계정 구분 포함).
     *
     * @param userId 로그인 아이디
     * @return 사용자 Optional
     */
    public Optional<User> findByUserId(String userId) {
        return userRepository.findByUserId(userId);
    }

    /**
     * 로그인 실패 횟수를 원자적으로 증가시키고 임계치 도달 시 잠금 시각을 기록합니다.
     *
     * @param userId 사용자 PK
     * @param maxFailCount 최대 실패 허용 횟수
     * @param lockUntil 잠금 만료 시각
     * @param now 현재 시각
     */
    @Transactional
    public void incrementLoginFailure(Long userId, int maxFailCount, LocalDateTime lockUntil, LocalDateTime now) {
        userRepository.incrementFailCountAndApplyLock(userId, maxFailCount, lockUntil, now);
    }

    /**
     * OAuth2 온보딩을 통해 소셜 신규 사용자 계정을 생성합니다.
     *
     * @param userId 블로그 핸들(로그인 아이디)
     * @param email 소셜 제공자 이메일
     * @param name 닉네임
     * @param termsAgreed 이용약관 동의 여부
     * @param privacyAgreed 개인정보처리방침 동의 여부
     * @param marketingAgreed 마케팅 수신 동의 여부
     * @return 저장된 사용자 엔티티
     */
    @Transactional
    public User createSocialUser(
        String userId,
        String email,
        String name,
        boolean termsAgreed,
        boolean privacyAgreed,
        boolean marketingAgreed) {
        String cleanUserId = userId.trim();
        String cleanEmail = email.trim();
        String cleanName = name.trim();

        if (!termsAgreed) {
            throw new TermsNotAgreedException();
        }
        if (!privacyAgreed) {
            throw new PrivacyNotAgreedException();
        }
        if (userRepository.existsByUserId(cleanUserId)) {
            throw new DuplicateUserIdException();
        }
        if (userRepository.existsByName(cleanName)) {
            throw new DuplicateNameException();
        }
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new DuplicateEmailException();
        }

        User user = User.builder()
            .userId(cleanUserId)
            .email(cleanEmail)
            .password(null)
            .name(cleanName)
            .termsAgreed(true)
            .privacyAgreed(true)
            .marketingAgreed(marketingAgreed)
            .agreedAt(LocalDateTime.now())
            .build();
        return userRepository.save(user);
    }

    /**
     * 로그인 아이디(블로그 핸들) 사용 가능 여부를 확인합니다.
     *
     * @param userId 확인할 아이디
     * @return 사용 가능하면 true
     */
    public boolean isUserIdAvailable(String userId) {
        if (userId == null || userId.isBlank()) {
            return false;
        }
        return !userRepository.existsByUserId(userId.trim());
    }

    /**
     * 닉네임 사용 가능 여부를 확인합니다.
     *
     * @param name 확인할 닉네임
     * @return 사용 가능하면 true
     */
    public boolean isNameAvailable(String name) {
        if (name == null || name.isBlank()) {
            return false;
        }
        return !userRepository.existsByName(name.trim());
    }
}

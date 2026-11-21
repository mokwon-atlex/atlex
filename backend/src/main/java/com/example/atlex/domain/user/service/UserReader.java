package com.example.atlex.domain.user.service;

import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.exception.UserNotFoundException;
import com.example.atlex.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
}

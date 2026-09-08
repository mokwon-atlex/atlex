package com.example.atlex.domain.user.repository;
//이메일 사용자 찾기, 저장(JpaRepository)

import com.example.atlex.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUserId(String userId);

    boolean existsByEmail(String email);

    Optional<User> findByUserId(String userId);

    Optional<User> findByIdAndActiveTrue(Long id);

    Optional<User> findByUserIdAndActiveTrue(String userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u SET u.failCount = u.failCount + 1, " +
        "u.lockedUntil = CASE WHEN u.failCount + 1 >= :maxFail AND (u.lockedUntil IS NULL OR u.lockedUntil < :now) THEN :lockUntil ELSE u.lockedUntil END "
        +
        "WHERE u.id = :id")
    void incrementFailCountAndApplyLock(@Param("id")
    Long id, @Param("maxFail")
    int maxFail, @Param("lockUntil")
    LocalDateTime lockUntil, @Param("now")
    LocalDateTime now);
}

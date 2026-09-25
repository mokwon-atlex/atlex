package com.example.atlex.domain.github.repository;

import com.example.atlex.domain.github.entity.GitHubSyncConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * GitHubSyncConfig 엔티티의 데이터 접근을 담당하는 레포지토리입니다.
 */
public interface GitHubSyncConfigRepository extends JpaRepository<GitHubSyncConfig, Long> {

    @Query("SELECT c FROM GitHubSyncConfig c JOIN FETCH c.user u WHERE u.id = :userId")
    Optional<GitHubSyncConfig> findWithUserByUserId(@Param("userId")
    Long userId);

    Optional<GitHubSyncConfig> findByUser_Id(Long userId);

    boolean existsByUser_Id(Long userId);

    void deleteByUser_Id(Long userId);
}

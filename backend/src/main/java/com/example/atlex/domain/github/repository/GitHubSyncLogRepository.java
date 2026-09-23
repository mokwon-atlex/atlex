package com.example.atlex.domain.github.repository;

import com.example.atlex.domain.github.entity.GitHubSyncLog;
import com.example.atlex.domain.github.entity.SyncLogStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * GitHubSyncLog 엔티티의 데이터 접근을 담당하는 레포지토리입니다.
 */
public interface GitHubSyncLogRepository extends JpaRepository<GitHubSyncLog, Long> {

    List<GitHubSyncLog> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<GitHubSyncLog> findByIdAndUserId(Long id, Long userId);

    Optional<GitHubSyncLog> findTopByUserIdAndPostIdAndStatusOrderByCreatedAtDesc(
        Long userId,
        Long postId,
        SyncLogStatus status);
}

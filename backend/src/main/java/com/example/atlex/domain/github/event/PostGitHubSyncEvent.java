package com.example.atlex.domain.github.event;

import com.example.atlex.domain.github.entity.SyncType;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 게시글 발행·수정·삭제 시 GitHub 비동기 동기화를 트리거하는 도메인 이벤트입니다.
 */
@Getter
@RequiredArgsConstructor
public class PostGitHubSyncEvent {
    private final Long postId;
    private final String postTitle;
    private final Long userId;
    private final SyncType syncType;

    public static PostGitHubSyncEvent create(Long postId, Long userId) {
        return new PostGitHubSyncEvent(postId, null, userId, SyncType.CREATE);
    }

    public static PostGitHubSyncEvent update(Long postId, Long userId) {
        return new PostGitHubSyncEvent(postId, null, userId, SyncType.UPDATE);
    }

    public static PostGitHubSyncEvent delete(Long postId, String postTitle, Long userId) {
        return new PostGitHubSyncEvent(postId, postTitle, userId, SyncType.DELETE);
    }
}

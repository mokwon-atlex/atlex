package com.example.atlex.domain.github.event;

import com.example.atlex.domain.github.entity.SyncType;
import com.example.atlex.domain.github.service.GitHubSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * 게시글 변경 트랜잭션이 성공적으로 커밋된 후, 비동기로 GitHub 동기화를 처리하는 리스너입니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PostGitHubEventListener {

    private final GitHubSyncService gitHubSyncService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePostGitHubSyncEvent(PostGitHubSyncEvent event) {
        log.debug("PostGitHubSyncEvent 수신: postId={}, type={}, userId={}",
            event.getPostId(), event.getSyncType(), event.getUserId());

        if (event.getSyncType() == SyncType.DELETE) {
            gitHubSyncService.syncDeletePost(event.getPostId(), event.getPostTitle(), event.getUserId());
        } else {
            gitHubSyncService.syncPost(event.getPostId(), event.getUserId(), event.getSyncType());
        }
    }
}

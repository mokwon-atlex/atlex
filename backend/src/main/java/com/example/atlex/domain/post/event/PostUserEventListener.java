package com.example.atlex.domain.post.event;

import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.user.event.UserDeactivatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * 사용자 탈퇴 시 동일 트랜잭션 내에서 해당 사용자의 게시글을 소프트 삭제하는 리스너입니다.
 */
@Component
@RequiredArgsConstructor
public class PostUserEventListener {

    private final PostRepository postRepository;

    /**
     * 탈퇴한 사용자의 모든 게시글을 소프트 삭제합니다.
     *
     * @param event 사용자 비활성화 이벤트
     */
    @EventListener
    public void handleUserDeactivated(UserDeactivatedEvent event) {
        postRepository.softDeleteAllByUserId(event.userId());
    }
}

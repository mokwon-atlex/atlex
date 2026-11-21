package com.example.atlex.domain.auth.event;

import com.example.atlex.domain.auth.repository.RefreshTokenRepository;
import com.example.atlex.domain.user.event.UserDeactivatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * 사용자 탈퇴 시 리프레시 토큰을 정리하는 리스너입니다.
 */
@Component
@RequiredArgsConstructor
public class AuthUserEventListener {

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * 탈퇴한 사용자의 리프레시 토큰이 존재하면 삭제합니다.
     *
     * @param event 사용자 비활성화 이벤트
     */
    @EventListener
    public void handleUserDeactivated(UserDeactivatedEvent event) {
        if (refreshTokenRepository.existsById(event.userId())) {
            refreshTokenRepository.deleteById(event.userId());
        }
    }
}

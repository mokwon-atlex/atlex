package com.example.atlex.domain.user.event;

/**
 * 사용자가 계정을 탈퇴(비활성화)할 때 연관 도메인 데이터를 정리하기 위해 발행되는 이벤트입니다.
 *
 * @param userId 비활성화된 사용자 PK
 */
public record UserDeactivatedEvent(Long userId) {
}

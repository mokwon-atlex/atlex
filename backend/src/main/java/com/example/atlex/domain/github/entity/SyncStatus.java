package com.example.atlex.domain.github.entity;

/**
 * 사용자의 전반적인 GitHub 동기화 상태입니다.
 */
public enum SyncStatus {
    /** 대기 상태 (정상 유휴) */
    IDLE,
    /** 동기화 진행 중 */
    SYNCING,
    /** 최근 동기화 성공 */
    SUCCESS,
    /** 최근 동기화 실패 */
    FAILED
}

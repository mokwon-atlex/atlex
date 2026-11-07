package com.example.atlex.domain.github.entity;

/**
 * 동기화 작업 유형입니다.
 */
public enum SyncType {
    /** 게시글 최초 발행/생성 동기화 */
    CREATE,
    /** 게시글 수정 동기화 */
    UPDATE,
    /** 게시글 삭제 동기화 */
    DELETE
}

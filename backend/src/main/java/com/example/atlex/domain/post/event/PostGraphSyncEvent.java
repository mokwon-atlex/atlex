package com.example.atlex.domain.post.event;

/**
 * 게시글 변경에 따라 지식 그래프 인덱스를 갱신하거나 제거하기 위해 발행되는 도메인 이벤트입니다.
 *
 * @param postId 대상 게시글 ID
 * @param action 그래프 동기화 작업 종류
 */
public record PostGraphSyncEvent(Long postId, Action action) {

    /**
     * 그래프 동기화 작업 종류입니다.
     */
    public enum Action {
        REFRESH,
        REMOVE
    }

    /**
     * 게시글 그래프 인덱스 갱신 이벤트를 생성합니다.
     *
     * @param postId 게시글 ID
     * @return 갱신 이벤트
     */
    public static PostGraphSyncEvent refresh(Long postId) {
        return new PostGraphSyncEvent(postId, Action.REFRESH);
    }

    /**
     * 게시글 그래프 인덱스 제거 이벤트를 생성합니다.
     *
     * @param postId 게시글 ID
     * @return 제거 이벤트
     */
    public static PostGraphSyncEvent remove(Long postId) {
        return new PostGraphSyncEvent(postId, Action.REMOVE);
    }
}

package com.example.atlex.domain.graph.event;

import com.example.atlex.domain.graph.service.GraphIndexService;
import com.example.atlex.domain.post.event.PostGraphSyncEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * 게시글 변경 이벤트를 수신해 지식 그래프 인덱스를 갱신·제거하는 리스너입니다.
 */
@Component
@RequiredArgsConstructor
public class PostGraphEventListener {

    private final GraphIndexService graphIndexService;

    /**
     * 게시글 생성·수정·삭제 이벤트에 따라 그래프 인덱스를 동기화합니다.
     *
     * @param event 게시글 그래프 동기화 이벤트
     */
    @EventListener
    public void handlePostGraphSync(PostGraphSyncEvent event) {
        if (event.action() == PostGraphSyncEvent.Action.REMOVE) {
            graphIndexService.removePostGraph(event.postId());
        } else {
            graphIndexService.refreshPostGraph(event.postId());
        }
    }
}

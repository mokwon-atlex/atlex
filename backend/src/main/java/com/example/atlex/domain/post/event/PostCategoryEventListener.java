package com.example.atlex.domain.post.event;

import com.example.atlex.domain.category.event.CategoryDeletedEvent;
import com.example.atlex.domain.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * 카테고리 삭제 시 동일 트랜잭션 내에서 게시글의 카테고리 연관관계를 해제하는 리스너입니다.
 */
@Component
@RequiredArgsConstructor
public class PostCategoryEventListener {

    private final PostRepository postRepository;

    /**
     * 삭제된 카테고리를 참조하는 게시글의 카테고리를 일괄 해제합니다.
     *
     * @param event 카테고리 삭제 이벤트
     */
    @EventListener
    public void handleCategoryDeleted(CategoryDeletedEvent event) {
        postRepository.clearCategoryByCategoryId(event.categoryId());
    }
}

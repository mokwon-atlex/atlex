package com.example.atlex.domain.category.event;

/**
 * 카테고리가 삭제될 때 연관 게시글의 카테고리 참조를 해제하기 위해 발행되는 도메인 이벤트입니다.
 *
 * @param categoryId 삭제 대상 카테고리 ID
 */
public record CategoryDeletedEvent(Long categoryId) {
}

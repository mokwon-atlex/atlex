package com.example.atlex.global.pagination;

import com.example.atlex.global.exception.ValidationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

/**
 * 커서 기반 목록 조회의 limit·cursor 파라미터를 검증하고 정규화하는 값 객체입니다.
 *
 * @param limit 정규화된 조회 개수
 * @param cursor 다음 페이지 기준 커서 (첫 페이지면 null)
 */
public record CursorPageRequest(int limit, Long cursor) {

    public static final int DEFAULT_LIMIT = 10;
    public static final int MAX_LIMIT = 50;

    /**
     * 요청된 limit과 cursor를 검증하고 기본값·상한을 적용해 생성합니다.
     *
     * @param limit 요청 페이지 크기 (null이면 기본값 10)
     * @param cursor 이전 페이지 마지막 ID (null 가능, 0 이하 불가)
     * @return 검증된 커서 페이지 요청
     */
    public static CursorPageRequest of(Integer limit, Long cursor) {
        int requestedLimit = limit == null ? DEFAULT_LIMIT : limit;
        if (requestedLimit <= 0) {
            throw new ValidationException();
        }
        if (cursor != null && cursor <= 0) {
            throw new ValidationException();
        }
        return new CursorPageRequest(Math.min(requestedLimit, MAX_LIMIT), cursor);
    }

    /**
     * hasNext 판별을 위해 limit + 1 크기의 Pageable을 반환합니다.
     *
     * @return 0페이지 기준 limit + 1 크기의 Pageable
     */
    public Pageable toFetchPageable() {
        return PageRequest.of(0, limit + 1);
    }
}

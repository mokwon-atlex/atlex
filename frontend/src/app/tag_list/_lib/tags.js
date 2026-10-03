import { fetchAllTags } from '@/lib/api/tags';

export const SORT_OPTIONS = [
  { label: '트렌딩', value: 'trending' },
  { label: '인기순', value: 'popular' },
  { label: '알파벳순', value: 'alphabet' },
];

export const PAGE_SIZE = 12;

export function getCacheKey(sort, keyword) {
  return `${sort}:${keyword}`;
}

/**
 * 플랫폼 전체 공개 태그 목록을 서버 API로부터 페이징 조회합니다.
 *
 * @param {object} params
 * @param {string} params.sort - 정렬 옵션 (trending, popular, alphabet)
 * @param {string} [params.keyword] - 검색 키워드
 * @param {number} params.page - 1부터 시작하는 페이지 번호
 * @returns {Promise<{ items: Array<{ name: string, postCount: number, trendScore: number }>, totalCount: number, hasMore: boolean }>}
 */
export async function fetchTags({ sort, keyword = '', page }) {
  try {
    const pageIndex = Math.max(0, page - 1);
    const data = await fetchAllTags({
      sort,
      keyword: keyword.trim(),
      page: pageIndex,
      size: PAGE_SIZE,
    });

    const items = (data?.content ?? []).map((t) => ({
      name: t.name,
      postCount: t.postCount ?? 0,
      trendScore: t.postCount ?? 0,
    }));

    const totalElements = data?.totalElements ?? items.length;
    const isLast = data?.last ?? items.length < PAGE_SIZE;

    return {
      items,
      totalCount: totalElements,
      hasMore: !isLast,
    };
  } catch (error) {
    console.error('Failed to fetch platform tags:', error);
    return {
      items: [],
      totalCount: 0,
      hasMore: false,
    };
  }
}

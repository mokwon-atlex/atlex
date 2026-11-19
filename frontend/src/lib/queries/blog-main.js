import { fetchPostGraph } from '@/lib/api/graph';
import { fetchPosts } from '@/lib/api/posts';
import { fetchAllTags } from '@/lib/api/tags';
import { toBlogMainPost } from '@/lib/mappers/post';

export async function loadMainPosts({ page = 0, size = 16, filterId, type, tag } = {}) {
  // 에러는 삼키지 않고 그대로 전파한다 — 호출부(app/page.jsx)에서 Next.js 에러 화면으로 surfacing.
  const resolvedType = type ?? filterId;
  const data = await fetchPosts({ page, size, type: resolvedType, tag });
  return {
    posts: data.content.map(toBlogMainPost),
    totalPages: data.totalPages,
  };
}

/**
 * 현재 선택된 메인 필터(trending, latest, feed)에 맞는 태그 목록을 조회한다.
 * 부가 탐색 요소이므로 조회 실패 시 빈 배열을 반환해 메인 피드 렌더링을 막지 않는다.
 *
 * @param {string} [filterId='trending'] 현재 보기 필터
 * @param {number} [size=12] 조회할 최대 태그 개수
 * @returns {Promise<Array<{ name: string, postCount: number }>>}
 */
export async function loadTagsByFilter(filterId = 'trending', size = 12) {
  const sortByFilter = {
    trending: 'trending',
    latest: 'popular',
    feed: 'alphabet',
  };
  const sort = sortByFilter[filterId] ?? 'trending';

  try {
    const data = await fetchAllTags({ sort, page: 0, size });
    return (data?.content ?? []).map((tag) => ({
      name: tag.name,
      postCount: tag.postCount ?? 0,
    }));
  } catch {
    return [];
  }
}

/**
 * 메인 상단 배너에 표시할 지식 그래프 요약 통계를 조회한다.
 *
 * @returns {Promise<{ nodeCount: number, edgeCount: number } | null>}
 */
export async function loadGraphOverview() {
  try {
    const data = await fetchPostGraph();
    const nodeCount = Array.isArray(data?.nodes) ? data.nodes.length : 0;
    const edgeCount = Array.isArray(data?.edges) ? data.edges.length : 0;
    return { nodeCount, edgeCount };
  } catch {
    return null;
  }
}

/**
 * 게시글 목록에서 썸네일 이미지가 설정된 글만 추려 최대 `limit`개 반환한다.
 *
 * @param {Array<object>} posts 변환된 메인 게시글 목록
 * @param {number} [limit=3] 최대 반환 개수
 * @returns {Array<object>} 이미지가 포함된 게시글 목록
 */
export function pickPopularImagePosts(posts = [], limit = 3) {
  return (posts ?? []).filter((post) => post?.cover?.variant === 'image' && Boolean(post?.cover?.url)).slice(0, limit);
}

/**
 * 메인 배너 3페이지에 표시할 이미지 포함 인기 게시글을 조회한다.
 *
 * @param {number} [limit=3] 최대 표시 개수
 * @returns {Promise<Array<object>>} 썸네일 이미지가 있는 인기 게시글 목록
 */
export async function loadPopularImagePosts(limit = 3) {
  try {
    const data = await fetchPosts({ page: 0, size: 16, type: 'trending' });
    const mapped = (data?.content ?? []).map(toBlogMainPost);
    return pickPopularImagePosts(mapped, limit);
  } catch {
    return [];
  }
}

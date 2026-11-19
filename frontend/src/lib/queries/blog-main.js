import { fetchPostGraph } from '@/lib/api/graph';
import { fetchPosts } from '@/lib/api/posts';
import { fetchAllTags } from '@/lib/api/tags';
import { toBlogMainPost } from '@/lib/mappers/post';

export async function loadMainPosts({ page = 0, size = 10, filterId, type, tag } = {}) {
  // 에러는 삼키지 않고 그대로 전파한다 — 호출부(app/page.jsx)에서 Next.js 에러 화면으로 surfacing.
  const resolvedType = type ?? filterId;
  const data = await fetchPosts({ page, size, type: resolvedType, tag });
  return {
    posts: data.content.map(toBlogMainPost),
    totalPages: data.totalPages,
  };
}

/**
 * 메인 탐색 바에 표시할 트렌딩 태그 목록을 조회한다.
 * 부가 탐색 요소이므로 조회 실패 시 빈 배열을 반환해 메인 피드 렌더링을 막지 않는다.
 *
 * @param {number} [size=10] 조회할 최대 태그 개수
 * @returns {Promise<Array<{ name: string, postCount: number }>>}
 */
export async function loadTrendingTags(size = 10) {
  try {
    const data = await fetchAllTags({ sort: 'trending', page: 0, size });
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

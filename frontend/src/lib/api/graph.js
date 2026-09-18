import { apiClient } from '@/lib/api/client';

/**
 * 게시글 관계 그래프를 조회한다.
 *
 * @param {{ userId?: string, categoryId?: number, minScore?: number }} params 조회 조건
 * @returns {Promise<{ nodes: object[], edges: object[] }>} 그래프 노드와 관계 목록
 */
export function fetchPostGraph({ userId, categoryId, minScore } = {}) {
  return apiClient.get('/graph', {
    params: {
      ...(userId && { userId }),
      ...(categoryId != null && { categoryId }),
      ...(minScore != null && { minScore }),
    },
  });
}

/**
 * 특정 게시글을 중심으로 관계 그래프를 조회한다.
 *
 * @param {number|string} postId 중심 게시글 식별자
 * @param {{ minScore?: number, limit?: number }} params 조회 조건
 * @returns {Promise<{ nodes: object[], edges: object[] }>} 그래프 노드와 관계 목록
 */
export function fetchPostGraphByPostId(postId, { minScore, limit } = {}) {
  return apiClient.get(`/graph/posts/${postId}`, {
    params: {
      ...(minScore != null && { minScore }),
      ...(limit != null && { limit }),
    },
  });
}

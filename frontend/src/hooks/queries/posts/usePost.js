// 게시글 단건 조회 쿼리 훅. 수정 화면 진입 시 기존 값을 불러올 때 사용한다.
//
// postId가 없으면 쿼리를 비활성화(enabled: false)해 불필요한 요청을 막는다.

'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPostById } from '@/lib/api/posts';

/**
 * 게시글 단건 조회 쿼리 훅.
 *
 * @param {string|number|undefined} postId - 조회할 게시글 ID. 없으면 쿼리를 비활성화한다.
 * @returns {import('@tanstack/react-query').UseQueryResult} 게시글 조회 결과(data/isLoading/isError 등).
 */
export function usePost(postId) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPostById(postId),
    enabled: Boolean(postId),
  });
}

// 게시글 단건 조회 쿼리 훅. 수정 화면 진입 시 기존 값을 불러올 때 사용한다.
//
// postId가 없으면 쿼리를 비활성화(enabled: false)해 불필요한 요청을 막는다.

'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPostById } from '@/lib/api/posts';

export function usePost(postId) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPostById(postId),
    enabled: Boolean(postId),
  });
}
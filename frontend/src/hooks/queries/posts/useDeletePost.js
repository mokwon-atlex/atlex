// 게시글 삭제 mutation 훅. 컴포넌트에서 mutate(postId) 또는 mutateAsync(postId) 를 호출한다.
//
// ── 라우팅 및 후처리를 이 훅에 두지 않는 이유 ──
// 삭제 성공 후 어디로 이동할지는 호출하는 화면(상세, 목록 등)에 따라 다를 수 있다.
// 훅의 재사용성을 유지하기 위해 라우팅 같은 후처리는 호출부의 options.onSuccess 로 위임한다.
// (예: mutate(postId, { onSuccess: () => router.push(...) }))

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost } from '@/lib/api/posts';

/**
 * 게시글 삭제 mutation 훅을 생성합니다.
 *
 * @param {import('@tanstack/react-query').UseMutationOptions} [options] - 추가 mutation 옵션
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useDeletePost(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    // options 를 먼저 펼치고 mutationFn 을 뒤에 둬, 외부 options 에 mutationFn 이
    // 섞여 들어와도 deletePost 가 덮어써지지 않게 한다.
    ...options,
    // deletePost 를 그대로 mutationFn 으로 쓴다.
    mutationFn: (postId) => deletePost(postId),
    onSuccess: (data, variables, context) => {
      // 캐시된 게시글 목록들을 무효화하여 삭제된 글이 목록에서 사라지도록 한다.
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
  });
}

// 게시글 수정 mutation 훅. 컴포넌트에서 mutate({ postId, ...payload }) 형태로 호출한다.
//
// payload: { title?, content?, description?, categoryId?, isPublic?, tags? }
//   - PATCH 이므로 값이 있는 필드만 보내면 된다
//     (lib/api/posts.js의 updatePost가 undefined 필드를 자동으로 걸러준다).
//
// useCreatePost와 동일하게 라우팅 같은 후처리는 호출부의 options.onSuccess로 위임한다.

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePost } from '@/lib/api/posts';

export function useUpdatePost(options) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ postId, ...payload }) => updatePost(postId, payload),
    onSuccess: (data, variables, context) => {
      // 상세/목록 캐시를 무효화해 수정 내용이 화면에 바로 반영되도록 한다.
      // TODO: queryKey 네이밍은 usePost, useInfinitePosts 쪽 실제 컨벤션에 맞춰
      //       조정이 필요할 수 있다(현재 usePost.js와 짝을 맞춰 ['post', postId]로 둠).
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}
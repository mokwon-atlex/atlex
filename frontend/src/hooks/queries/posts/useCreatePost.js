// 게시글 작성 mutation 훅. 컴포넌트에서 mutate(payload) 를 호출하면 된다.
//
// payload: { title, content, description?, categoryId?, isPublic?, tags? }
//   - content 는 tiptap 의 getHTML() 결과(HTML 문자열).
//   - 토큰은 client.js 의 request interceptor 가 자동 첨부하므로 여기서 신경 쓸 필요 없다.
//
// ── 라우팅을 이 훅에 두지 않는 이유 ──
// 작성 성공 후 어디로 이동할지는 호출하는 화면마다 다를 수 있다.
// 훅을 재사용 가능하게 유지하기 위해 라우팅 같은 후처리는 호출부의 options.onSuccess 로 넘긴다.
// (예: mutate(payload, { onSuccess: (data) => router.push(...) }))

'use client';

import { useMutation } from '@tanstack/react-query';
import { createPost } from '@/lib/api/posts';

export function useCreatePost(options) {
  return useMutation({
    // options 를 먼저 펼치고 mutationFn 을 뒤에 둬, 외부 options 에 mutationFn 이
    // 섞여 들어와도 createPost 가 덮어써지지 않게 한다.
    ...options,
    // createPost 를 그대로 mutationFn 으로 쓴다. 응답(envelope 푼 data)이 그대로 전달된다.
    mutationFn: createPost,
  });
}

'use client';

// 게시물·댓글 신고 접수 mutation 훅.
// 신고는 다른 화면의 캐시에 영향을 주지 않으므로 별도 캐시 무효화를 하지 않는다.

import { useMutation } from '@tanstack/react-query';
import { reportCommentApi, reportPostApi } from '@/lib/api/reports';

/**
 * 대상 종류에 따라 게시물 또는 댓글 신고 API를 호출하는 훅.
 * @returns {import('@tanstack/react-query').UseMutationResult} mutate({ targetType, targetId, reason, description })
 */
export function useCreateReport() {
  return useMutation({
    mutationFn: ({ targetType, targetId, reason, description }) => {
      const payload = { reason, description };
      return targetType === 'COMMENT' ? reportCommentApi(targetId, payload) : reportPostApi(targetId, payload);
    },
  });
}

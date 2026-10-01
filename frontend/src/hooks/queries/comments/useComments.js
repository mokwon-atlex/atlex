'use client';

// 게시글 댓글 목록 조회 및 작성/수정/삭제를 담당하는 TanStack Query 훅.
// 서버 상태 동기화를 위해 댓글 변경(작성/수정/삭제) 성공 시 해당 게시글의 댓글 캐시를 무효화(invalidate)한다.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createComment, deleteComment, fetchComments, updateComment } from '@/lib/api/comments';

/**
 * 화면에 노출되는 살아있는 댓글과 답글 수를 센다.
 * 답글 보존을 위해 자리만 남은 삭제 댓글은 제외한다.
 * @param {import('@/lib/api/comments').Comment[]} comments - 최상위 댓글 목록
 * @returns {number} 살아있는 댓글과 답글 수
 */
function countActiveComments(comments) {
  return comments.reduce((count, comment) => count + (comment.deleted ? 0 : 1) + (comment.replies?.length ?? 0), 0);
}

/**
 * 게시글의 댓글 목록과 변경 mutation을 제공하는 훅.
 * @param {number|string} postId - 대상 게시글 ID
 */
export function useComments(postId) {
  const queryClient = useQueryClient();
  const queryKey = ['posts', String(postId), 'comments'];

  const commentsQuery = useQuery({
    queryKey,
    queryFn: () => fetchComments(postId),
    enabled: Boolean(postId),
  });

  const createMutation = useMutation({
    mutationFn: ({ content, parentId }) => createComment(postId, { content, parentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }) => updateComment(commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const comments = commentsQuery.data ?? [];

  return {
    comments,
    // 답글을 포함한 살아있는 댓글 수
    commentCount: countActiveComments(comments),
    isLoading: commentsQuery.isLoading,
    isError: commentsQuery.isError,
    error: commentsQuery.error,
    refetch: commentsQuery.refetch,
    // 생성 mutation (parentId를 지정하면 답글 작성)
    createComment: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    // 수정 mutation
    updateComment: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    // 삭제 mutation
    deleteComment: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}

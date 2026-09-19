'use client';

// 게시글 댓글 목록 조회 및 작성/수정/삭제를 담당하는 TanStack Query 훅.
// 서버 상태 동기화를 위해 댓글 변경(작성/수정/삭제) 성공 시 해당 게시글의 댓글 캐시를 무효화(invalidate)한다.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createComment, deleteComment, fetchComments, updateComment } from '@/lib/api/comments';

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
    mutationFn: ({ content }) => createComment(postId, { content }),
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

  return {
    comments: commentsQuery.data ?? [],
    isLoading: commentsQuery.isLoading,
    isError: commentsQuery.isError,
    error: commentsQuery.error,
    refetch: commentsQuery.refetch,
    // 생성 mutation
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

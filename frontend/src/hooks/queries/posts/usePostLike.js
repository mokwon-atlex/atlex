'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addPostLike, fetchPostById, removePostLike } from '@/lib/api/posts';
import { useAuthStore } from '@/store/authStore';

/**
 * 좋아요 요청 전 클라이언트 유효성 검증 실패 시 발생하는 오류입니다.
 */
export class LikeValidationError extends Error {
  /**
   * @param {string} message - 오류 메시지
   * @param {string} [code] - 오류 코드 ('UNAUTHORIZED' | 'INVALID_POST_ID' | 'LIKE_STATE_UNAVAILABLE')
   */
  constructor(message, code) {
    super(message);
    this.name = 'LikeValidationError';
    this.code = code;
    this.isValidationError = true;
  }
}

/**
 * 게시글별 좋아요 상태 쿼리 키를 만듭니다.
 *
 * 목록 캐시(`['posts', ...]`)와 접두사를 겹치지 않게 두어,
 * 토글 후 목록을 무효화할 때 이 쿼리까지 재요청되지 않도록 합니다.
 *
 * 로그아웃 시 전역 캐시를 비우지 않으므로, 계정을 바꿨을 때 앞 사용자의
 * 좋아요 상태가 남지 않도록 키에 사용자를 포함합니다.
 *
 * @param {number|string} postId - 게시글 ID
 * @param {string|null} [userId] - 현재 로그인 사용자 식별자 (비로그인은 null)
 * @returns {Array} 쿼리 키
 */
export function postLikeQueryKey(postId, userId = null) {
  return ['post-like', userId ?? 'anonymous', String(postId)];
}

/**
 * 특정 게시글의 좋아요 상태 조회 및 등록/해제 토글을 처리하는 훅입니다.
 *
 * SSR 응답에는 Authorization 헤더가 붙지 않아(client.js 는 브라우저에서만 토큰을 첨부)
 * 서버에서 내려온 `liked` 는 항상 false 입니다. 그래서 로그인 상태이면 화면 진입 후
 * 한 번 다시 조회해 실제 좋아요 상태로 보정하고, 그 조회가 성공하기 전에는 토글을 막습니다.
 *
 * @param {number|string} [postId] - 게시글 ID
 * @param {Object} [options] - 추가 옵션
 * @param {boolean} [options.initialLiked=false] - SSR 에서 내려온 초기 좋아요 여부
 * @param {number} [options.initialLikes=0] - SSR 에서 내려온 초기 좋아요 수
 * @returns {{
 *   isLoggedIn: boolean,
 *   isLiked: boolean,
 *   likes: number,
 *   isStateReady: boolean,
 *   isStateLoading: boolean,
 *   stateError: Error | null,
 *   retryLikeState: () => void,
 *   isPending: boolean,
 *   toggleLike: () => Promise<unknown>,
 *   error: Error | null
 * }}
 */
export function usePostLike(postId, { initialLiked = false, initialLikes = 0 } = {}) {
  const queryClient = useQueryClient();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const currentUserId = useAuthStore((s) => s.user?.userId ?? null);
  const queryKey = postLikeQueryKey(postId, currentUserId);

  const likeStateQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const post = await fetchPostById(postId);
      return { liked: Boolean(post.liked), likes: post.likes ?? 0 };
    },
    enabled: Boolean(isLoggedIn && postId),
  });

  const isLiked = likeStateQuery.data?.liked ?? initialLiked;
  const likes = likeStateQuery.data?.likes ?? initialLikes;

  // isStateLoading 이 false 라는 것은 "조회가 끝났다"는 뜻이지 "성공했다"는 뜻이 아니다.
  // 조회가 실패하면 SSR 기본값(false)만 남으므로, 그 상태로 토글하면 반대 요청이 나간다.
  // 그래서 로그인 사용자는 본인 좋아요 상태를 확보(isSuccess)해야만 토글을 허용한다.
  const isStateReady = !isLoggedIn || likeStateQuery.isSuccess;

  const toggleMutation = useMutation({
    // 요청 시작 시점의 값만 사용한다. 진행 중 계정이 바뀌어 훅이 다시 렌더돼도
    // 이 요청은 시작할 때 고정한 키와 대상 상태로 끝난다.
    mutationFn: ({ postId: targetPostId, liked }) => (liked ? removePostLike(targetPostId) : addPostLike(targetPostId)),

    // 낙관적 갱신: 응답을 기다리지 않고 먼저 반영하고, 실패하면 직전 값으로 되돌린다.
    onMutate: async ({ queryKey: targetKey, liked, likes: currentLikes }) => {
      await queryClient.cancelQueries({ queryKey: targetKey });
      const previous = queryClient.getQueryData(targetKey);

      queryClient.setQueryData(targetKey, {
        liked: !liked,
        likes: Math.max(0, currentLikes + (liked ? -1 : 1)),
      });

      return { previous, queryKey: targetKey };
    },

    onError: (error, variables, context) => {
      if (!context) return;

      // setQueryData(key, undefined) 는 캐시를 되돌리지도 지우지도 않는 no-op 이다.
      // 직전 캐시가 없던 경우에는 낙관적으로 쓴 값을 명시적으로 지우고 다시 조회한다.
      if (context.previous === undefined) {
        queryClient.removeQueries({ queryKey: context.queryKey, exact: true });
        queryClient.invalidateQueries({ queryKey: context.queryKey, exact: true });
        return;
      }

      queryClient.setQueryData(context.queryKey, context.previous);
    },

    // 서버 응답(PostLikeResponse)의 liked/likes 가 최종 기준이다.
    onSuccess: (response, variables, context) => {
      queryClient.setQueryData(context.queryKey, {
        liked: Boolean(response?.liked),
        likes: response?.likes ?? variables.likes,
      });
      // 목록 캐시는 비활성 상태면 재요청 없이 stale 로만 표시돼, 목록으로 돌아갈 때 최신 수치를 받는다.
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const toggleLike = () => {
    if (!isLoggedIn) {
      return Promise.reject(new LikeValidationError('로그인이 필요합니다.', 'UNAUTHORIZED'));
    }
    if (!postId) {
      return Promise.reject(new LikeValidationError('게시글 정보가 올바르지 않습니다.', 'INVALID_POST_ID'));
    }
    // 버튼 비활성화와 별개로 여기서도 막는다. 상태를 모른 채 보내는 요청은 반대 동작이 된다.
    if (!isStateReady) {
      return Promise.reject(
        new LikeValidationError('좋아요 상태를 불러오지 못했습니다. 다시 시도해 주세요.', 'LIKE_STATE_UNAVAILABLE'),
      );
    }

    return toggleMutation.mutateAsync({ postId, queryKey, liked: isLiked, likes });
  };

  return {
    isLoggedIn,
    isLiked,
    likes,
    isStateReady,
    isStateLoading: likeStateQuery.isLoading,
    stateError: isLoggedIn ? (likeStateQuery.error ?? null) : null,
    retryLikeState: likeStateQuery.refetch,
    isPending: toggleMutation.isPending,
    toggleLike,
    error: toggleMutation.error,
  };
}

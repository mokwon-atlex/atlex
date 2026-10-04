'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addPostFavorite, fetchFavoritePosts, fetchPostById, removePostFavorite } from '@/lib/api/posts';
import { useAuthStore } from '@/store/authStore';

/**
 * 즐겨찾기 요청 전 클라이언트 유효성 검증 실패 시 발생하는 오류입니다.
 */
export class FavoriteValidationError extends Error {
  /**
   * @param {string} message - 오류 메시지
   * @param {string} [code] - 오류 코드 ('UNAUTHORIZED' | 'INVALID_POST_ID' | 'FAVORITE_STATE_UNAVAILABLE')
   */
  constructor(message, code) {
    super(message);
    this.name = 'FavoriteValidationError';
    this.code = code;
    this.isValidationError = true;
  }
}

/** 즐겨찾기 목록 쿼리 키 */
export const FAVORITES_QUERY_KEY = ['posts', 'favorites'];

/**
 * 게시글별 즐겨찾기 상태 쿼리 키를 만듭니다.
 *
 * 목록 캐시(`['posts', ...]`)와 접두사를 겹치지 않게 두어,
 * 토글 후 목록을 무효화할 때 이 쿼리까지 재요청되지 않도록 합니다.
 * 계정이 바뀌면 `resetQueriesOnUserChange`가 캐시 전체를 초기화하므로 키에 사용자를 넣지 않습니다.
 *
 * @param {number|string} postId - 게시글 ID
 * @returns {Array} 쿼리 키
 */
export function postFavoriteQueryKey(postId) {
  return ['post-favorite', String(postId)];
}

/**
 * 로그인 사용자의 즐겨찾기 게시글 목록을 조회하는 쿼리 훅입니다.
 *
 * @param {Object} [params] - 페이징 파라미터
 * @param {number} [params.page=0] - 페이지 번호
 * @param {number} [params.size=10] - 페이지 크기
 * @returns {import('@tanstack/react-query').UseQueryResult} 쿼리 결과
 */
export function useFavorites({ page = 0, size = 10 } = {}) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: [...FAVORITES_QUERY_KEY, { page, size }],
    queryFn: () => fetchFavoritePosts({ page, size }),
    enabled: isLoggedIn,
  });
}

/**
 * 특정 게시글의 즐겨찾기 상태 조회 및 등록/해제 토글을 처리하는 훅입니다.
 *
 * SSR 응답에는 Authorization 헤더가 붙지 않아 서버에서 내려온 `favorited` 는 항상 false 입니다.
 * 그래서 로그인 상태이면 화면 진입 후 상세를 한 번 다시 조회해 실제 상태로 보정하고,
 * 그 조회가 성공하기 전에는 토글을 막습니다.
 *
 * @param {number|string} [postId] - 게시글 ID
 * @param {Object} [options] - 추가 옵션
 * @param {boolean} [options.initialFavorited=false] - SSR 에서 내려온 초기 즐겨찾기 여부
 * @returns {{
 *   isLoggedIn: boolean,
 *   isFavorited: boolean,
 *   isStateReady: boolean,
 *   isPending: boolean,
 *   stateError: Error | null,
 *   retryFavoriteState: () => void,
 *   toggleFavorite: () => Promise<unknown>,
 *   error: Error | null
 * }}
 */
export function usePostFavorite(postId, { initialFavorited = false } = {}) {
  const queryClient = useQueryClient();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const queryKey = postFavoriteQueryKey(postId);

  const favoriteStateQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const post = await fetchPostById(postId);
      return { favorited: Boolean(post.favorited) };
    },
    enabled: Boolean(isLoggedIn && postId),
  });

  const isFavorited = favoriteStateQuery.data?.favorited ?? initialFavorited;
  // 조회가 실패한 채로 토글하면 SSR 기본값(false) 기준의 반대 요청이 나가므로, 성공했을 때만 허용한다.
  const isStateReady = !isLoggedIn || favoriteStateQuery.isSuccess;

  const toggleMutation = useMutation({
    mutationFn: ({ postId: targetPostId, favorited }) =>
      favorited ? removePostFavorite(targetPostId) : addPostFavorite(targetPostId),

    // 서버 응답(PostFavoriteResponse)의 favorited 가 최종 기준이다.
    onSuccess: (response, variables) => {
      queryClient.setQueryData(variables.queryKey, { favorited: Boolean(response?.favorited) });
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  const toggleFavorite = () => {
    if (!isLoggedIn) {
      return Promise.reject(new FavoriteValidationError('로그인이 필요합니다.', 'UNAUTHORIZED'));
    }
    if (!postId) {
      return Promise.reject(new FavoriteValidationError('게시글 정보가 올바르지 않습니다.', 'INVALID_POST_ID'));
    }
    if (!isStateReady) {
      return Promise.reject(
        new FavoriteValidationError(
          '즐겨찾기 상태를 불러오지 못했습니다. 다시 시도해 주세요.',
          'FAVORITE_STATE_UNAVAILABLE',
        ),
      );
    }

    return toggleMutation.mutateAsync({ postId, queryKey, favorited: isFavorited });
  };

  return {
    isLoggedIn,
    isFavorited,
    isStateReady,
    stateError: isLoggedIn ? (favoriteStateQuery.error ?? null) : null,
    retryFavoriteState: favoriteStateQuery.refetch,
    isPending: toggleMutation.isPending,
    toggleFavorite,
    error: toggleMutation.error,
  };
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addPostFavorite, fetchFavoritePosts, removePostFavorite } from '@/lib/api/posts';
import { useAuthStore } from '@/store/authStore';

/** 즐겨찾기 목록 쿼리 키 */
export const FAVORITES_QUERY_KEY = ['posts', 'favorites'];

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
 * @param {number|string} [postId] - 게시글 ID
 * @param {Object} [options] - 추가 옵션
 * @param {boolean} [options.initialFavorited] - 초기 즐겨찾기 여부 (SSR 등에서 전달 시)
 * @param {(result: { postId: number|string, favorited: boolean }) => void} [options.onSuccess] - 토글 성공 콜백
 * @param {(error: Error) => void} [options.onError] - 토글 실패 콜백
 * @returns {{
 *   isLoggedIn: boolean,
 *   isFavorited: boolean,
 *   isLoading: boolean,
 *   isPending: boolean,
 *   toggleFavorite: () => Promise<{ postId: number|string, favorited: boolean }>,
 *   error: Error | null
 * }}
 */
export function usePostFavorite(postId, options = {}) {
  const queryClient = useQueryClient();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  // 로그인 상태인 경우 내 즐겨찾기 목록을 조회해 현재 글의 등록 여부를 판단
  const { data: favoritesData, isLoading: isFavoritesLoading } = useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: () => fetchFavoritePosts({ page: 0, size: 100 }),
    enabled: Boolean(isLoggedIn && postId),
  });

  const isFavoritedFromServer = Boolean(favoritesData?.content?.some((item) => String(item.id) === String(postId)));

  const isFavorited = favoritesData ? isFavoritedFromServer : Boolean(options.initialFavorited);

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!isLoggedIn) {
        throw new Error('로그인이 필요합니다.');
      }
      if (!postId) {
        throw new Error('게시글 정보가 올바르지 않습니다.');
      }

      if (isFavorited) {
        await removePostFavorite(postId);
        return { postId, favorited: false };
      }

      await addPostFavorite(postId);
      return { postId, favorited: true };
    },
    onSuccess: (result) => {
      // 캐시 무효화로 서버와 최신 상태 동기화
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
      options.onSuccess?.(result);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });

  return {
    isLoggedIn,
    isFavorited,
    isLoading: isFavoritesLoading,
    isPending: toggleMutation.isPending,
    toggleFavorite: toggleMutation.mutateAsync,
    error: toggleMutation.error,
  };
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addPostFavorite, fetchFavoritePosts, removePostFavorite } from '@/lib/api/posts';
import { useAuthStore } from '@/store/authStore';

/**
 * 즐겨찾기 요청 전 클라이언트 유효성 검증 실패 시 발생하는 오류입니다.
 */
export class FavoriteValidationError extends Error {
  /**
   * @param {string} message - 오류 메시지
   * @param {string} [code] - 오류 코드 (예: 'UNAUTHORIZED', 'INVALID_POST_ID')
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
 * 사용자의 즐겨찾기 목록 전체를 페이지 단위로 순회하여 특정 게시글의 포함 여부를 확인합니다.
 *
 * @param {number|string} postId - 확인할 게시글 ID
 * @returns {Promise<boolean>} 즐겨찾기 포함 여부
 */
async function fetchIsFavorited(postId) {
  let page = 0;
  const size = 100;

  while (true) {
    const res = await fetchFavoritePosts({ page, size });
    const content = Array.isArray(res?.content) ? res.content : [];
    if (content.some((item) => String(item.id) === String(postId))) {
      return true;
    }

    const totalPages = res?.totalPages;
    const isLast = res?.last ?? (totalPages != null && page + 1 >= totalPages);
    if (isLast || content.length === 0) {
      return false;
    }

    page += 1;
  }
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

  // 로그인 상태인 경우 내 즐겨찾기 목록을 순회 조회해 현재 글의 등록 여부를 판단
  const { data: isFavoritedFromServer, isLoading: isFavoritesLoading } = useQuery({
    queryKey: [...FAVORITES_QUERY_KEY, 'post', String(postId)],
    queryFn: () => fetchIsFavorited(postId),
    enabled: Boolean(isLoggedIn && postId),
  });

  const isFavorited =
    typeof isFavoritedFromServer === 'boolean' ? isFavoritedFromServer : Boolean(options.initialFavorited);

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!isLoggedIn) {
        throw new FavoriteValidationError('로그인이 필요합니다.', 'UNAUTHORIZED');
      }
      if (!postId) {
        throw new FavoriteValidationError('게시글 정보가 올바르지 않습니다.', 'INVALID_POST_ID');
      }

      if (isFavorited) {
        await removePostFavorite(postId);
        return { postId, favorited: false };
      }

      await addPostFavorite(postId);
      return { postId, favorited: true };
    },
    onSuccess: async (result) => {
      // 캐시 무효화로 서버와 최신 상태 동기화 (재조회 완료까지 대기)
      await queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
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

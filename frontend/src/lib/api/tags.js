import { apiClient } from '@/lib/api/client';

// GET /tags?userId={userId}&limit={limit}&cursor={cursor}
// 특정 사용자의 블로그 태그 목록 조회
export function fetchUserTags(userId, { limit = 50, cursor } = {}) {
  return apiClient.get('/tags', {
    params: {
      userId,
      ...(limit != null && { limit }),
      ...(cursor != null && { cursor }),
    },
  });
}

// 기존 getTags 하위 호환용
export function getTags(limitOrUserId = 10, cursor = 0) {
  if (typeof limitOrUserId === 'string') {
    return fetchUserTags(limitOrUserId, { limit: 10, cursor });
  }
  return apiClient.get('/tags', { params: { limit: limitOrUserId, cursor } });
}

// GET /tags/all?sort={sort}&keyword={keyword}&page={page}&size={size}
// 플랫폼 전체 공개 태그 목록 페이징 조회
export function fetchAllTags({ sort = 'trending', keyword = '', page = 0, size = 12 } = {}) {
  return apiClient.get('/tags/all', {
    params: {
      sort,
      ...(keyword && { keyword }),
      page,
      size,
    },
  });
}

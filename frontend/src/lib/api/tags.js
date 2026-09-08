import { apiClient } from '@/lib/api/client';

// GET /tags
export function getTags(limit = 10, cursor = 0) {
  return apiClient.get('/tags', { params: { limit, cursor } });
}

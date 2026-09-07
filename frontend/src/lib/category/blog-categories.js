import { apiClient } from "@/lib/api/client";
import { CATEGORY_PAGE_SIZE, normalizeCategoryList } from "@/lib/blog-option";

export async function loadUserBlogCategories(userId, limit = CATEGORY_PAGE_SIZE) {
  if (!userId) {
    return [];
  }
  const collectedCategories = [];
  let nextCursor = null;

  while (true) {
    const params = { limit };

    if (nextCursor != null) {
      params.cursor = nextCursor;
    }

    const response = await apiClient.get(`/users/${userId}/categories`, {
      params,
    });

    collectedCategories.push(...normalizeCategoryList(response));

    if (!response?.hasNext || response?.nextCursor == null) {
      break;
    }

    nextCursor = response.nextCursor;
  }

  return collectedCategories;
}

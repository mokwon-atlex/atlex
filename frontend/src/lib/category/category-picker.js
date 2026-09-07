export const ALL_CATEGORY_ID = "all";

function toDateValue(date) {
  if (!date) {
    return 0;
  }

  return Date.parse(date.replaceAll(".", "-")) || 0;
}

export function findCategoryById(categories, categoryId) {
  return categories.find((category) => category.id === categoryId);
}

function getCategoryLabel(category) {
  return String(category?.label ?? category?.name ?? "").trim();
}

export function filterPostsByCategoryId(posts = [], categories = [], categoryId) {
  if (!categoryId || categoryId === ALL_CATEGORY_ID) {
    return posts;
  }

  const selectedCategory = findCategoryById(categories, categoryId);
  if (!selectedCategory) {
    return [];
  }

  if (Array.isArray(selectedCategory.postIds)) {
    const postIds = new Set(selectedCategory.postIds);
    return posts.filter((post) => postIds.has(post.id));
  }

  const selectedCategoryLabel = getCategoryLabel(selectedCategory);

  if (!selectedCategoryLabel) {
    return [];
  }

  return posts.filter(
    (post) => String(post?.category ?? "").trim() === selectedCategoryLabel
  );
}

export function getCategoryPickerItems(categories, posts) {
  return categories.map((category) => {
    const relatedPosts = filterPostsByCategoryId(posts, categories, category.id);
    const latestPost = [...relatedPosts].sort(
      (left, right) => toDateValue(right.date) - toDateValue(left.date)
    )[0];
    const normalizedPostCount = Number(category.postCount);
    const hasServerPostCount = Number.isFinite(normalizedPostCount);

    let postCount = hasServerPostCount ? normalizedPostCount : relatedPosts.length;

    if (!hasServerPostCount && category.id === ALL_CATEGORY_ID) {
      postCount = posts.length;
    }

    if (!hasServerPostCount && Array.isArray(category.postIds)) {
      postCount = category.postIds.length;
    }

    return {
      ...category,
      label: getCategoryLabel(category),
      latestPost,
      postCount,
    };
  });
}

export const CATEGORY_PAGE_SIZE = 10;
export const BLOG_OPTION_BIO_MAX_LENGTH = 30;

export function normalizeBlogBio(profile) {
  if (typeof profile?.info === "string") {
    return profile.info;
  }

  if (typeof profile?.bio === "string") {
    return profile.bio;
  }

  if (typeof profile?.description === "string") {
    return profile.description;
  }

  return "";
}

function normalizeCategoryItem(category, index) {
  const source = category?.category ?? category?.item ?? category;
  const id =
    source?.id ?? source?.categoryId ?? source?.categoryID ?? index;
  const name = String(
    source?.name ??
      source?.categoryName ??
      source?.label ??
      source?.title ??
      ""
  ).trim();
  const postCount = Number(
    source?.postCount ?? source?.postsCount ?? source?.count ?? 0
  );
  const thumbnailUrl =
    typeof source?.thumbnailUrl === "string" ? source.thumbnailUrl : null;

  if (!name) {
    return null;
  }

  return {
    id: String(id),
    name,
    label: name,
    postCount: Number.isFinite(postCount) ? postCount : 0,
    thumbnailUrl,
  };
}

export function normalizeCategoryList(response) {
  const rawCategories =
    [
      response,
      response?.content,
      response?.items,
      response?.categories,
      response?.list,
      response?.data,
      response?.data?.content,
      response?.data?.items,
      response?.data?.categories,
      response?.data?.list,
      response?.result,
      response?.result?.content,
      response?.result?.items,
      response?.result?.categories,
      response?.result?.list,
      response?.values,
    ].find(Array.isArray) ?? [];

  return rawCategories
    .map((category, index) => normalizeCategoryItem(category, index))
    .filter(Boolean);
}

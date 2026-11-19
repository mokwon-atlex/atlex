export const CATEGORY_PAGE_SIZE = 10;
export const BLOG_OPTION_BIO_MAX_LENGTH = 30;

export function normalizeBlogBio(profile) {
  if (typeof profile?.info === 'string') {
    return profile.info;
  }

  if (typeof profile?.bio === 'string') {
    return profile.bio;
  }

  if (typeof profile?.description === 'string') {
    return profile.description;
  }

  return '';
}

function normalizeCategoryItem(category, index) {
  const source = category?.category ?? category?.item ?? category;
  const id = source?.id ?? source?.categoryId ?? source?.categoryID ?? index;
  const name = String(source?.name ?? source?.categoryName ?? source?.label ?? source?.title ?? '').trim();
  const postCount = Number(source?.postCount ?? source?.postsCount ?? source?.count ?? 0);
  const thumbnailUrl = typeof source?.thumbnailUrl === 'string' ? source.thumbnailUrl : null;

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

  return rawCategories.map((category, index) => normalizeCategoryItem(category, index)).filter(Boolean);
}

export const DEFAULT_BLOG_SKIN = 'DEFAULT';

/** 블로그 홈 스킨 목록. id 는 백엔드 BlogSkin 값과 같아야 한다. */
export const BLOG_SKINS = [
  { id: 'DEFAULT', name: '기본', description: '프로필 사이드바와 글 목록으로 구성된 기본 화면' },
  { id: 'MINIMAL', name: '미니멀', description: '상단 좌우에 프로필과 지식 화분을 두고, 아래에 연도별 글 목록을 배치' },
];

/** 알 수 없는 값이나 빈 값은 기본 스킨으로 본다. */
export function normalizeBlogSkin(value) {
  return BLOG_SKINS.some((skin) => skin.id === value) ? value : DEFAULT_BLOG_SKIN;
}

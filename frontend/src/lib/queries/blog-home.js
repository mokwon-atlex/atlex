import { fetchProfileByUserId } from '@/lib/api/profiles';
import { fetchUserBlogPosts } from '@/lib/api/posts';
import { loadUserBlogCategories } from '@/lib/category/blog-categories';
import { ALL_CATEGORY_ID } from '@/lib/category/category-picker';
import { toBlogHomeProfile } from '@/lib/mappers/user';
import { toBlogHomeFeedPost } from '@/lib/mappers/post';

function createAllCategory(totalCount) {
  return {
    id: ALL_CATEGORY_ID,
    label: '전체 글',
    postCount: totalCount,
    thumbnailUrl: null,
  };
}

function toCategoryPickerCategory(category) {
  return {
    id: String(category.id),
    label: category.label ?? category.name,
    postCount: category.postCount ?? 0,
    thumbnailUrl: category.thumbnailUrl ?? null,
  };
}

function createPagination(currentPage, totalPages) {
  const safeTotalPages = Math.max(Number(totalPages) || 1, 1);

  return [
    { id: 'prev', label: '<', kind: 'control' },
    ...Array.from({ length: safeTotalPages }, (_, index) => {
      const page = index + 1;

      return {
        id: `page-${page}`,
        label: String(page),
        current: page === currentPage,
      };
    }),
    { id: 'next', label: '>', kind: 'control' },
  ];
}

async function loadBlogCategories(identifier) {
  const categories = await loadUserBlogCategories(identifier);
  return categories.map(toCategoryPickerCategory);
}

export async function loadBlogHomeData(identifier) {
  // 에러는 삼키지 않고 그대로 전파한다 — 백엔드 연동 단계에서 미연동/장애를 곧바로 드러내기 위함.
  // - USER_NOT_FOUND 는 호출부([username]/page.jsx)가 notFound() 로 처리.
  // - 그 외(권한/네트워크 등)도 전파되어 에러 화면으로 surfacing.
  //
  // 프로필은 공개 엔드포인트 GET /profiles/{userId} 를 쓴다.
  // (GET /users/{id} 는 인증 필요 + 숫자 id 전용이라, 토큰 없는 SSR 에서 401 이 나 에러였다.)
  // 개인 블로그 홈은 현재 블로그 주인의 게시글만 보여준다.
  // 백엔드 필터가 느슨하게 동작해도 화면에 다른 사용자의 글이 섞이지 않도록
  // 응답 후 authorUserId 기준으로 한 번 더 방어 필터링한다.
  // 프로필·게시글 조회는 서로 독립적이라 병렬로 요청해 SSR 응답을 줄인다.
  const [profileData, postsPage, categories] = await Promise.all([
    fetchProfileByUserId(identifier),
    fetchUserBlogPosts({ page: 0, size: 10, userId: identifier }),
    loadBlogCategories(identifier),
  ]);

  const profile = toBlogHomeProfile(profileData);
  const postContent = Array.isArray(postsPage?.content) ? postsPage?.content : [];
  const ownerPostContent = postContent.filter((post) =>
    isPostWrittenByUser(post, identifier)
  );
  const posts = ownerPostContent.map(toBlogHomeFeedPost);
  const totalCount =
    ownerPostContent.length === postContent.length
      ? postsPage?.totalElements ?? ownerPostContent.length
      : ownerPostContent.length;
  const totalPages =
    ownerPostContent.length === postContent.length
      ? postsPage?.totalPages ?? Math.max(Math.ceil(totalCount / 10), 1)
      : Math.max(Math.ceil(totalCount / 10), 1);

  const feed = {
    page: 1,
    pageSize: 10,
    totalPages,
    totalCount,
    filterLabel: '이번 주',
    sortLabel: '최신순',
    helperText:
      '제목과 본문은 카드형 목록으로 유지하고, 피드 중심의 배치로 재정렬한 정적 목업입니다.',
    pageSizeLabel: '한 페이지에 최대 10개',
    posts,
    pagination: createPagination(1, totalPages),
  };

  return {
    profile,
    feed,
    categories: [createAllCategory(totalCount), ...categories],
  };
}

function isPostWrittenByUser(post, userId) {
  const postAuthorUserId =
    post?.authorUserId ??
    post?.userId ??
    post?.author?.userId ??
    post?.user?.userId;

  if (postAuthorUserId == null) {
    return false;
  }

  return String(postAuthorUserId).toLowerCase() === String(userId).toLowerCase();
}

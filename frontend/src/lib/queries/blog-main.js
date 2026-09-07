import { fetchPosts } from '@/lib/api/posts';
import { toBlogMainPost } from '@/lib/mappers/post';

export async function loadMainPosts({ page = 0, size = 10 } = {}) {
  // 에러는 삼키지 않고 그대로 전파한다 — 호출부(app/page.jsx)에서 Next.js 에러 화면으로 surfacing.
  const data = await fetchPosts({ page, size });
  return {
    posts: data.content.map(toBlogMainPost),
    totalPages: data.totalPages,
  };
}

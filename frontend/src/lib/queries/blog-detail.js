import { fetchPostById } from '@/lib/api/posts';
import { toBlogDetail } from '@/lib/mappers/post';

export async function loadBlogDetailData(postId, authorUserId) {
  const apiPost = await fetchPostById(postId);
  // 작성자 소유 검증. 일치하지 않으면 null을 반환해 404 페이지로 유도한다.
  if (apiPost.authorUserId !== authorUserId) return null;
  return toBlogDetail(apiPost);
}

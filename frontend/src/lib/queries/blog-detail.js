import { fetchPostById } from '@/lib/api/posts';
import { toBlogDetail } from '@/lib/mappers/post';

export async function loadBlogDetailData(postId, authorUserId) {
  const apiPost = await fetchPostById(postId);
  // 작성자 소유 검증. 단, 백엔드 응답에 authorUserId 가 아직 없을 수 있으므로(미보강)
  // 값이 있을 때만 비교한다. (DTO 보강 전까지의 임시 폴백 — Notion 참고)
  if (apiPost.authorUserId != null && apiPost.authorUserId !== authorUserId) return null;
  return toBlogDetail(apiPost);
}

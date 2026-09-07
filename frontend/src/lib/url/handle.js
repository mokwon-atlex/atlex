// @userId 형식 URL segment 처리 헬퍼

export function stripHandle(segment) {
  if (!segment) return segment;
  return segment.startsWith("@") ? segment.slice(1) : segment;
}

export function userBlogHref(userId) {
  return `/@${userId}`;
}

export function postDetailHref(userId, postId) {
  return `/@${userId}/${postId}`;
}

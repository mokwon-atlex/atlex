// 게시글 엔드포인트를 직접 호출하는 API 레이어.
// 응답 데이터는 가공하지 않고 그대로 반환하고, 매핑/캐싱 정책은 상위 query/hook 에서 처리한다.
// 백엔드 스펙이 바뀌면 이 파일의 경로, 메서드, 쿼리 파라미터만 맞춰 주면 된다.

import { apiClient } from "@/lib/api/client";

// 게시글 목록 조회.
// page, size 로 페이지네이션하고 authorUserId, type 이 있으면 해당 조건으로 필터링한다.
// 응답 예시: { content: ApiPost[], totalElements, totalPages, ... }
export function fetchPosts({ authorUserId, page = 0, size = 10, type } = {}) {
  return apiClient.get("/posts", {
    params: {
      page,
      size,
      ...(authorUserId && { authorUserId }),
      ...(type && { type }),
    }
  });
}

// GET /posts?userId={userId}&categoryId={categoryId}&tags={tags}&page={page}&size={size} — 특정 유저 게시글 목록 조회.
// Authorization 헤더는 필요 시 client.js 의 request interceptor 가 store 에서 토큰을 읽어 자동 첨부한다.
// payload: { userId?, categoryId?, type?, tags?, page?, size? }
export function fetchUserBlogPosts({
  userId,
  categoryId,
  type,
  tags,
  page = 0,
  size = 10,
} = {}) {
  return apiClient.get("/posts", {
    params: {
      page,
      size,
      ...(userId && { userId }),
      ...(categoryId !== undefined && { categoryId }),
      ...(type && { type }),
      ...(tags !== undefined && { tags }),
    }
  });
}

// GET /posts/{postId} — 게시글 단건 조회. 없으면 envelope code 가 POST_NOT_FOUND 인 에러로 throw.
export function fetchPostById(postId) {
  return apiClient.get(`/posts/${postId}`);
}

// POST /posts — 게시글 작성.
// Authorization 헤더는 client.js 의 request interceptor 가 store 에서 토큰을 읽어 자동 첨부한다.
// payload: { categoryId?, title, description?, content, tags?, isPublic? }
export function createPost({ categoryId, title, description, content, tags, isPublic } = {}) {
  return apiClient.post("/posts", {
    ...(categoryId != null && { categoryId }),
    title,
    description,
    content,
    ...(tags !== undefined && { tags }),
    ...(isPublic !== undefined && { isPublic }),
  });
}

// PATCH /posts/{postId} — 게시글 수정.
// Authorization 헤더는 client.js 의 request interceptor 가 store 에서 토큰을 읽어 자동 첨부한다.
// payload: { categoryId?, title?, description?, content?, tags?, isPublic? }
export function updatePost(
  postId,
  { categoryId, title, description, content, tags, isPublic } = {},
) {
  return apiClient.patch(`/posts/${postId}`, {
    ...(categoryId !== undefined && { categoryId }),
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(content !== undefined && { content }),
    ...(tags !== undefined && { tags }),
    ...(isPublic !== undefined && { isPublic }),
  });
}

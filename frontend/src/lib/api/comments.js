// 댓글 엔드포인트를 직접 호출하는 API 레이어.
// 백엔드 명세:
// - POST /api/v1/posts/{postId}/comments (댓글 생성)
// - GET /api/v1/posts/{postId}/comments (댓글 목록 조회)
// - PATCH /api/v1/comments/{commentId} (댓글 수정)
// - DELETE /api/v1/comments/{commentId} (댓글 삭제)

import { apiClient } from '@/lib/api/client';

/**
 * 특정 게시글의 댓글 목록을 조회합니다.
 * @param {number|string} postId - 게시글 ID
 * @returns {Promise<Array<{
 *   id: number,
 *   postId: number,
 *   content: string,
 *   authorId: number,
 *   authorUserId: string,
 *   authorName: string,
 *   createdAt: string,
 *   updatedAt: string
 * }>>} 댓글 목록
 */
export function fetchComments(postId) {
  return apiClient.get(`/posts/${postId}/comments`);
}

/**
 * 특정 게시글에 새 댓글을 작성합니다.
 * Authorization 헤더는 client.js 인터셉터에서 자동으로 첨부됩니다.
 * @param {number|string} postId - 게시글 ID
 * @param {{ content: string }} payload - 댓글 데이터
 * @returns {Promise<{
 *   id: number,
 *   postId: number,
 *   content: string,
 *   authorId: number,
 *   authorUserId: string,
 *   authorName: string,
 *   createdAt: string,
 *   updatedAt: string
 * }>} 작성된 댓글 정보
 */
export function createComment(postId, { content }) {
  return apiClient.post(`/posts/${postId}/comments`, { content });
}

/**
 * 특정 댓글을 수정합니다.
 * Authorization 헤더는 client.js 인터셉터에서 자동으로 첨부됩니다.
 * @param {number|string} commentId - 댓글 ID
 * @param {{ content: string }} payload - 수정할 내용
 * @returns {Promise<{
 *   id: number,
 *   postId: number,
 *   content: string,
 *   authorId: number,
 *   authorUserId: string,
 *   authorName: string,
 *   createdAt: string,
 *   updatedAt: string
 * }>} 수정된 댓글 정보
 */
export function updateComment(commentId, { content }) {
  return apiClient.patch(`/comments/${commentId}`, { content });
}

/**
 * 특정 댓글을 삭제합니다.
 * Authorization 헤더는 client.js 인터셉터에서 자동으로 첨부됩니다.
 * @param {number|string} commentId - 댓글 ID
 * @returns {Promise<void>}
 */
export function deleteComment(commentId) {
  return apiClient.delete(`/comments/${commentId}`);
}

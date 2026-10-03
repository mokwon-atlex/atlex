// 댓글 엔드포인트를 직접 호출하는 API 레이어.
// 백엔드 명세:
// - POST /api/v1/posts/{postId}/comments (댓글·답글 생성)
// - GET /api/v1/posts/{postId}/comments (최상위 댓글과 답글 목록 조회)
// - PATCH /api/v1/comments/{commentId} (댓글 수정)
// - DELETE /api/v1/comments/{commentId} (댓글 삭제)

import { apiClient } from '@/lib/api/client';

/**
 * 댓글 또는 답글 응답.
 * 답글이 남은 삭제 댓글은 deleted가 true이며 content와 작성자 정보가 null이다.
 * @typedef {object} Comment
 * @property {number} id - 댓글 ID
 * @property {number} postId - 게시글 ID
 * @property {number|null} parentId - 부모 댓글 ID (최상위 댓글이면 null)
 * @property {boolean} deleted - 삭제 여부
 * @property {string|null} content - 댓글 내용
 * @property {number|null} authorId - 작성자 DB ID
 * @property {string|null} authorUserId - 작성자 아이디
 * @property {string|null} authorName - 작성자 닉네임
 * @property {string} createdAt - 작성일시
 * @property {string|null} updatedAt - 수정일시
 * @property {Comment[]} [replies] - 답글 목록 (목록 조회의 최상위 댓글에만 포함)
 */

/**
 * 특정 게시글의 댓글 목록을 조회합니다.
 * 최상위 댓글을 오래된 순으로 반환하며, 각 댓글의 replies에 답글을 같은 순서로 포함합니다.
 * @param {number|string} postId - 게시글 ID
 * @returns {Promise<Comment[]>} 최상위 댓글 목록
 */
export function fetchComments(postId) {
  return apiClient.get(`/posts/${postId}/comments`);
}

/**
 * 특정 게시글에 새 댓글 또는 답글을 작성합니다.
 * Authorization 헤더는 client.js 인터셉터에서 자동으로 첨부됩니다.
 * @param {number|string} postId - 게시글 ID
 * @param {{ content: string, parentId?: number }} payload - 댓글 데이터 (답글이면 최상위 댓글 ID를 parentId로 지정)
 * @returns {Promise<Comment>} 작성된 댓글 정보
 */
export function createComment(postId, { content, parentId }) {
  // 최상위 댓글 작성 시에는 parentId를 보내지 않는다.
  const body = parentId == null ? { content } : { content, parentId };
  return apiClient.post(`/posts/${postId}/comments`, body);
}

/**
 * 특정 댓글을 수정합니다.
 * Authorization 헤더는 client.js 인터셉터에서 자동으로 첨부됩니다.
 * @param {number|string} commentId - 댓글 ID
 * @param {{ content: string }} payload - 수정할 내용
 * @returns {Promise<Comment>} 수정된 댓글 정보
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

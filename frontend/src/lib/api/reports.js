// 신고 엔드포인트를 직접 호출하는 API 레이어.
// 백엔드 명세:
// - POST /api/v1/posts/{postId}/reports (게시물 신고)
// - POST /api/v1/comments/{commentId}/reports (댓글 신고)
// - GET /api/v1/admin/reports (관리자 신고 목록)
// - GET /api/v1/admin/reports/{reportId} (관리자 신고 상세)
// - PATCH /api/v1/admin/reports/{reportId} (관리자 신고 처리)

import { apiClient } from '@/lib/api/client';

/**
 * @typedef {object} ReportCreatePayload
 * @property {string} reason - 신고 사유(SPAM, ABUSE, OBSCENE, PRIVACY, COPYRIGHT, OTHER)
 * @property {string} [description] - 추가 설명(OTHER이면 필수, 최대 500자)
 */

/**
 * @typedef {object} AdminReport
 * @property {number} id - 신고 ID
 * @property {'POST'|'COMMENT'} targetType - 신고 대상 종류
 * @property {number} targetId - 신고 대상 ID
 * @property {string} reason - 신고 사유
 * @property {string|null} description - 추가 설명
 * @property {'PENDING'|'RESOLVED'|'REJECTED'} status - 처리 상태
 * @property {string} reporterUserId - 신고자 아이디
 * @property {string} reporterName - 신고자 닉네임
 * @property {string|null} processedByUserId - 처리 관리자 아이디
 * @property {string|null} resultMemo - 처리 메모
 * @property {string|null} processedAt - 처리 일시
 * @property {string} createdAt - 신고 일시
 */

/**
 * 게시물을 신고합니다.
 * @param {number|string} postId - 게시물 ID
 * @param {ReportCreatePayload} payload - 신고 내용
 * @returns {Promise<object>} 접수된 신고
 */
export function reportPostApi(postId, { reason, description }) {
  return apiClient.post(`/posts/${postId}/reports`, { reason, description });
}

/**
 * 댓글을 신고합니다.
 * @param {number|string} commentId - 댓글 ID
 * @param {ReportCreatePayload} payload - 신고 내용
 * @returns {Promise<object>} 접수된 신고
 */
export function reportCommentApi(commentId, { reason, description }) {
  return apiClient.post(`/comments/${commentId}/reports`, { reason, description });
}

/**
 * 관리자 신고 목록을 조회합니다. 값이 없는 필터는 전송하지 않습니다.
 * @param {{ status?: string, targetType?: string, page?: number, size?: number }} params - 조회 조건
 * @returns {Promise<{ content: AdminReport[], totalElements: number, totalPages: number, number: number }>} 신고 페이지
 */
export function fetchAdminReportsApi({ status, targetType, page = 0, size = 20 } = {}) {
  const params = { page, size };
  if (status) params.status = status;
  if (targetType) params.targetType = targetType;
  return apiClient.get('/admin/reports', { params });
}

/**
 * 관리자 신고 상세를 조회합니다.
 * @param {number|string} reportId - 신고 ID
 * @returns {Promise<{ report: AdminReport, target: object|null }>} 신고 정보와 대상 요약
 */
export function fetchAdminReportApi(reportId) {
  return apiClient.get(`/admin/reports/${reportId}`);
}

/**
 * 신고 처리 결과를 기록합니다.
 * @param {number|string} reportId - 신고 ID
 * @param {{ status: 'RESOLVED'|'REJECTED', resultMemo: string }} payload - 처리 결과
 * @returns {Promise<AdminReport>} 처리된 신고
 */
export function processAdminReportApi(reportId, { status, resultMemo }) {
  return apiClient.patch(`/admin/reports/${reportId}`, { status, resultMemo });
}

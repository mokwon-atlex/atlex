import { apiClient } from '@/lib/api/client';

/**
 * 로그인한 사용자의 알림 목록을 조회한다.
 *
 * @param {{ page?: number, size?: number }} params 페이지 조건
 * @returns {Promise<{ content: object[], totalElements: number }>} 알림 페이지 응답
 */
export function fetchNotifications({ page = 0, size = 20 } = {}) {
  return apiClient.get('/notifications', {
    params: { page, size },
  });
}

/**
 * 로그인한 사용자의 읽지 않은 알림 개수를 조회한다.
 *
 * @returns {Promise<{ unreadCount: number }>} 읽지 않은 알림 개수
 */
export function fetchUnreadNotificationCount() {
  return apiClient.get('/notifications/unread-count');
}

/**
 * 특정 알림을 읽음 상태로 변경한다.
 *
 * @param {number|string} notificationId 알림 ID
 * @returns {Promise<null>}
 */
export function markNotificationAsRead(notificationId) {
  return apiClient.patch(`/notifications/${notificationId}/read`);
}

/**
 * 모든 읽지 않은 알림을 읽음 상태로 변경한다.
 *
 * @returns {Promise<null>}
 */
export function markAllNotificationsAsRead() {
  return apiClient.patch('/notifications/read-all');
}

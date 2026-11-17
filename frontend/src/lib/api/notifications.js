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

/**
 * 로그인한 사용자의 알림 수신 설정을 조회한다.
 *
 * @returns {Promise<{ commentEnabled: boolean, likeEnabled: boolean, followEnabled: boolean, noticeEnabled: boolean }>}
 */
export function fetchNotificationSettings() {
  return apiClient.get('/notifications/settings');
}

/**
 * 로그인한 사용자의 알림 수신 설정을 저장한다.
 *
 * @param {{ commentEnabled: boolean, likeEnabled: boolean, followEnabled: boolean, noticeEnabled: boolean }} body
 * @returns {Promise<{ commentEnabled: boolean, likeEnabled: boolean, followEnabled: boolean, noticeEnabled: boolean }>}
 */
export function updateNotificationSettings(body) {
  return apiClient.patch('/notifications/settings', body);
}

/**
 * 특정 알림을 삭제한다.
 *
 * @param {number|string} notificationId 알림 ID
 * @returns {Promise<null>}
 */
export function deleteNotification(notificationId) {
  return apiClient.delete(`/notifications/${notificationId}`);
}

/**
 * 로그인한 사용자의 모든 알림을 삭제한다.
 *
 * @returns {Promise<null>}
 */
export function deleteAllNotifications() {
  return apiClient.delete('/notifications');
}

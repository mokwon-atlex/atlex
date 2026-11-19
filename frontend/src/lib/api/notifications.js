import { getApiBaseUrl } from '@/lib/api/baseUrl';
import { apiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/tokens';

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

/**
 * SSE 버퍼에서 완성된 이벤트 블록(\n\n 구분)을 파싱해 콜백으로 전달하고 남은 버퍼를 반환한다.
 *
 * @param {string} buffer 누적된 텍스트 버퍼
 * @param {(eventName: string, data: string) => void} onFrame 완성된 프레임 처리기
 * @returns {string} 아직 완성되지 않은 나머지 버퍼
 */
export function consumeSseBuffer(buffer, onFrame) {
  const normalized = buffer.replace(/\r\n/g, '\n');
  const blocks = normalized.split('\n\n');
  const remainder = blocks.pop() ?? '';

  for (const block of blocks) {
    if (!block.trim()) continue;

    let eventName = 'message';
    const dataLines = [];

    for (const line of block.split('\n')) {
      if (!line || line.startsWith(':')) continue;
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    if (dataLines.length > 0) {
      onFrame(eventName, dataLines.join('\n'));
    }
  }

  return remainder;
}

/**
 * 실시간 알림 SSE 스트림을 구독한다.
 * 브라우저 EventSource는 Authorization 헤더를 보낼 수 없으므로 fetch 스트림을 사용한다.
 *
 * @param {{ signal?: AbortSignal, onOpen?: () => void, onNotification?: (payload: object) => void }} options
 * @returns {Promise<void>} 스트림이 종료되면 resolve된다.
 */
export async function subscribeNotifications({ signal, onOpen, onNotification } = {}) {
  const openStream = () => {
    const token = getAccessToken();
    const headers = {
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return fetch(`${getApiBaseUrl()}/notifications/subscribe`, {
      method: 'GET',
      headers,
      cache: 'no-store',
      signal,
    });
  };

  let response = await openStream();

  // accessToken 만료(401) 시 기존 apiClient의 single-flight 토큰 재발급 흐름을 태운 뒤 1회 재연결한다.
  if (response.status === 401 && !signal?.aborted) {
    await fetchUnreadNotificationCount();
    response = await openStream();
  }

  if (!response.ok || !response.body) {
    throw new Error(`알림 스트림 연결에 실패했습니다. (status: ${response.status})`);
  }

  onOpen?.();

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = consumeSseBuffer(buffer, (eventName, rawData) => {
        if (eventName !== 'notification') return;
        try {
          onNotification?.(JSON.parse(rawData));
        } catch {
          onNotification?.(null);
        }
      });
    }
  } finally {
    reader.releaseLock();
  }
}

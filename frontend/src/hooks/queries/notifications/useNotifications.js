'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  deleteAllNotifications,
  deleteNotification,
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeNotifications,
} from '@/lib/api/notifications';
import { useAuthStore } from '@/store/authStore';

export const NOTIFICATION_QUERY_KEYS = {
  list: ['notifications', 'list'],
  unreadCount: ['notifications', 'unread-count'],
};

const SSE_BASE_RETRY_DELAY_MS = 3_000;
const SSE_MAX_RETRY_DELAY_MS = 30_000;

/**
 * 읽지 않은 알림 개수를 조회하고, 로그인 상태에서는 SSE 스트림으로 실시간 갱신한다.
 * SSE 연결이 끊긴 동안에는 30초 폴링을 안전망으로 유지한다.
 */
export function useUnreadNotificationCount() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const queryClient = useQueryClient();
  const [isStreamConnected, setIsStreamConnected] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || typeof window === 'undefined') {
      setIsStreamConnected(false);
      return;
    }

    let cancelled = false;
    let retryTimer = null;
    let retryAttempt = 0;
    let controller = null;

    const connect = async () => {
      if (cancelled) return;
      controller = new AbortController();

      try {
        await subscribeNotifications({
          signal: controller.signal,
          onOpen: () => {
            retryAttempt = 0;
            if (!cancelled) {
              setIsStreamConnected(true);
            }
          },
          onNotification: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          },
        });
      } catch {
        // 연결 실패/종료 시 아래 재연결 로직으로 복구한다.
      }

      if (cancelled) return;
      setIsStreamConnected(false);
      const delay = Math.min(SSE_BASE_RETRY_DELAY_MS * 2 ** retryAttempt, SSE_MAX_RETRY_DELAY_MS);
      retryAttempt += 1;
      retryTimer = window.setTimeout(connect, delay);
    };

    connect();

    return () => {
      cancelled = true;
      setIsStreamConnected(false);
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
      }
      controller?.abort();
    };
  }, [isLoggedIn, queryClient]);

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
    queryFn: fetchUnreadNotificationCount,
    enabled: Boolean(isLoggedIn),
    refetchInterval: isStreamConnected ? false : 30_000,
    select: (data) => data?.unreadCount ?? 0,
  });
}

/**
 * 팝오버가 열렸을 때 알림 목록을 조회한다.
 */
export function useNotificationList({ enabled = false, page = 0, size = 20 } = {}) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: [...NOTIFICATION_QUERY_KEYS.list, { page, size }],
    queryFn: () => fetchNotifications({ page, size }),
    enabled: Boolean(isLoggedIn) && enabled,
  });
}

/**
 * 단건 알림 읽음 처리 mutation.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * 전체 알림 읽음 처리 mutation.
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * 단건 알림 삭제 mutation.
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * 전체 알림 삭제 mutation.
 */
export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

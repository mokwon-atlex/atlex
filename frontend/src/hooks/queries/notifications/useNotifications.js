'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteAllNotifications,
  deleteNotification,
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/lib/api/notifications';
import { useAuthStore } from '@/store/authStore';

export const NOTIFICATION_QUERY_KEYS = {
  list: ['notifications', 'list'],
  unreadCount: ['notifications', 'unread-count'],
};

/**
 * 읽지 않은 알림 개수를 주기적으로 조회한다.
 */
export function useUnreadNotificationCount() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
    queryFn: fetchUnreadNotificationCount,
    enabled: Boolean(isLoggedIn),
    refetchInterval: 30_000,
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

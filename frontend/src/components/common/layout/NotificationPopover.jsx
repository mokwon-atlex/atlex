'use client';

import { Bell, CheckCheck, Heart, Loader2, Megaphone, MessageSquare, Trash2, UserPlus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/ui/button';
import { Capsule } from '@/components/common/ui/capsule';
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/common/ui/popover';
import {
  useDeleteAllNotifications,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationList,
  useUnreadNotificationCount,
} from '@/hooks/queries/notifications/useNotifications';
import { postDetailHref, userBlogHref } from '@/lib/url/handle';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const NOTIFICATION_TYPE_META = {
  COMMENT: { icon: MessageSquare, actionText: '님이 게시글에 댓글을 남겼습니다.' },
  REPLY: { icon: MessageSquare, actionText: '님이 회원님의 댓글에 답글을 남겼습니다.' },
  LIKE: { icon: Heart, actionText: '님이 회원님의 게시글을 좋아합니다.' },
  FOLLOW: { icon: UserPlus, actionText: '님이 회원님을 팔로우하기 시작했습니다.' },
  NOTICE: { icon: Megaphone, actionText: '새로운 서비스 공지가 도착했습니다.' },
};

function formatRelativeTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return '방금 전';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export default function NotificationPopover({ mounted, onNotification }) {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [open, setOpen] = useState(false);

  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data: notificationPage, isLoading } = useNotificationList({ enabled: open });
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();
  const deleteAllMutation = useDeleteAllNotifications();

  const notifications = notificationPage?.content ?? [];
  const showUnreadBadge = mounted && isLoggedIn && unreadCount > 0;

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    if (nextOpen) {
      onNotification?.();
    }
  };

  const handleItemClick = (item) => {
    if (!item.isRead) {
      markReadMutation.mutate(item.id);
    }

    if (item.type === 'FOLLOW') {
      if (!item.actorUserId) {
        toast.error('사용자 정보를 찾을 수 없습니다.');
        return;
      }
      setOpen(false);
      router.push(userBlogHref(item.actorUserId));
      return;
    }

    if (item.type === 'NOTICE') {
      setOpen(false);
      if (!item.postDeleted && item.postId && item.postAuthorUserId) {
        router.push(postDetailHref(item.postAuthorUserId, item.postId));
      }
      return;
    }

    if (item.postDeleted || !item.postId || !item.postAuthorUserId) {
      toast.error('삭제된 게시글입니다.');
      return;
    }

    setOpen(false);
    router.push(postDetailHref(item.postAuthorUserId, item.postId));
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        nativeButton={false}
        render={
          <Capsule
            variant="outline"
            size="lg"
            role="button"
            tabIndex={0}
            aria-label="알림"
            className="relative h-10 cursor-pointer gap-2 px-3 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground sm:px-4"
          >
            <Bell className="size-4" strokeWidth={2.5} />
            <span className="hidden text-sm font-bold sm:inline">알림</span>
            {showUnreadBadge ? (
              <span
                aria-label={`읽지 않은 알림 ${unreadCount}개`}
                className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </Capsule>
        }
      />

      <PopoverContent align="end" sideOffset={8} className="w-80 p-0 sm:w-96">
        <PopoverHeader className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <PopoverTitle className="text-sm font-bold">알림</PopoverTitle>
          {mounted && isLoggedIn ? (
            <div className="flex items-center gap-1">
              {unreadCount > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                  disabled={markAllReadMutation.isPending}
                  onClick={() => markAllReadMutation.mutate()}
                >
                  <CheckCheck className="size-3.5" />
                  모두 읽음
                </Button>
              ) : null}
              {notifications.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
                  disabled={deleteAllMutation.isPending}
                  onClick={() => deleteAllMutation.mutate()}
                >
                  <Trash2 className="size-3.5" />
                  전체 삭제
                </Button>
              ) : null}
            </div>
          ) : null}
        </PopoverHeader>

        {!mounted || !isLoggedIn ? (
          <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">로그인 후 새 알림을 확인할 수 있습니다.</p>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              로그인하기
            </Link>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">도착한 알림이 없습니다.</div>
        ) : (
          <div className="max-h-96 divide-y divide-border overflow-y-auto">
            {notifications.map((item) => {
              const meta = NOTIFICATION_TYPE_META[item.type] ?? NOTIFICATION_TYPE_META.COMMENT;
              const Icon = meta.icon;

              return (
                <div
                  key={item.id}
                  className={cn(
                    'group relative flex w-full items-start gap-2 px-4 py-3 transition-colors hover:bg-muted/50',
                    !item.isRead ? 'bg-primary/5' : '',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  >
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-xs leading-relaxed text-foreground">
                        {item.type === 'NOTICE' ? (
                          meta.actionText
                        ) : (
                          <>
                            <span className="font-semibold">{item.actorName || item.actorUserId}</span>
                            {meta.actionText}
                          </>
                        )}
                      </p>
                      {item.postTitle ? (
                        <p className="truncate text-xs font-medium text-muted-foreground">{item.postTitle}</p>
                      ) : null}
                      {item.commentContent ? (
                        <p className="line-clamp-2 rounded bg-muted/60 px-2 py-1 text-xs text-muted-foreground">
                          {item.commentContent}
                        </p>
                      ) : null}
                      <p className="text-[11px] text-muted-foreground/80">{formatRelativeTime(item.createdAt)}</p>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {!item.isRead ? <span className="size-2 rounded-full bg-primary" /> : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="알림 삭제"
                      disabled={deleteMutation.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(item.id);
                      }}
                      className="size-6 text-muted-foreground opacity-60 hover:text-destructive group-hover:opacity-100"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

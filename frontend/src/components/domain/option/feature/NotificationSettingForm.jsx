'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Switch } from '@/components/common/ui/switch';
import { fetchNotificationSettings, updateNotificationSettings } from '@/lib/api/notifications';
import { useAuthStore } from '@/store/authStore';

const NOTIFICATIONS = [
  {
    key: 'commentEnabled',
    title: '댓글 알림',
    description: '새 댓글이 등록되면 알림을 받습니다.',
  },
  {
    key: 'likeEnabled',
    title: '좋아요 알림',
    description: '게시글 좋아요 알림을 받습니다.',
  },
  {
    key: 'followEnabled',
    title: '새 팔로워 알림',
    description: '새로운 팔로워가 생기면 알림을 받습니다.',
  },
  {
    key: 'noticeEnabled',
    title: '서비스 공지',
    description: '중요한 공지 및 업데이트를 받습니다.',
  },
];

const DEFAULT_SETTINGS = {
  commentEnabled: true,
  likeEnabled: true,
  followEnabled: true,
  noticeEnabled: true,
};

function NotificationSettingForm() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    fetchNotificationSettings()
      .then((data) => {
        if (!cancelled && data) {
          setSettings({
            commentEnabled: data.commentEnabled ?? true,
            likeEnabled: data.likeEnabled ?? true,
            followEnabled: data.followEnabled ?? true,
            noticeEnabled: data.noticeEnabled ?? true,
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  async function handleSave() {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const updated = await updateNotificationSettings(settings);
      if (updated) {
        setSettings({
          commentEnabled: updated.commentEnabled ?? settings.commentEnabled,
          likeEnabled: updated.likeEnabled ?? settings.likeEnabled,
          followEnabled: updated.followEnabled ?? settings.followEnabled,
          noticeEnabled: updated.noticeEnabled ?? settings.noticeEnabled,
        });
      }
      setStatusMessage({ type: 'success', text: '알림 설정을 저장했습니다.' });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error?.message ?? '알림 설정 저장에 실패했습니다.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="rounded-xl border-border/60 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>알림 설정</CardTitle>
        <CardDescription>원하는 알림만 선택해서 받아볼 수 있습니다.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {NOTIFICATIONS.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-4"
          >
            <div>
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </div>

            <Switch
              checked={settings[item.key]}
              disabled={isLoading || isSaving}
              aria-label={item.title}
              onCheckedChange={(checked) => {
                setStatusMessage(null);
                setSettings((prev) => ({
                  ...prev,
                  [item.key]: Boolean(checked),
                }));
              }}
            />
          </div>
        ))}

        {statusMessage ? (
          <p
            role={statusMessage.type === 'error' ? 'alert' : 'status'}
            className={`text-sm font-medium ${
              statusMessage.type === 'error' ? 'text-destructive' : 'text-emerald-600'
            }`}
          >
            {statusMessage.text}
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="justify-end">
        <Button type="button" disabled={isLoading || isSaving} onClick={handleSave}>
          {isSaving ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export { NotificationSettingForm };

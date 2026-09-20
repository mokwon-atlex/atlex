'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/ui/button';

// postId 를 알아야 이동시킬 수 있는 액션들의 경로 매핑.
// '통계', '삭제' 등 아직 목적지가 없는 액션은 여기 없으면 기존처럼 버튼만 렌더링된다.
// (삭제는 이슈 #15와 별도 이슈로 분리되어 이번 작업 범위에 포함하지 않음)
const ACTION_HREF_BUILDERS = {
  수정: (postId) => `/write/${postId}`,
};

export function AdminActions({ authorUserId, postId, actions = [] }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);

  if (!isLoggedIn || user?.userId !== authorUserId) return null;

  return (
    <div className="inline-flex flex-nowrap items-center gap-1 rounded-full border border-border bg-card p-1">
      {actions.map((action) => {
        const buildHref = ACTION_HREF_BUILDERS[action];
        const href = postId != null ? buildHref?.(postId) : null;

        const button = (
          <Button type="button" variant="ghost" size="sm" className="rounded-full px-4">
            {action}
          </Button>
        );

        if (href) {
          return (
            <Link key={action} href={href}>
              {button}
            </Link>
          );
        }

        return <span key={action}>{button}</span>;
      })}
    </div>
  );
}

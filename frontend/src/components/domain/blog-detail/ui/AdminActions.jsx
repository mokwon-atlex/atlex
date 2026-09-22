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

/**
 * 게시글 작성자 전용 액션 버튼 목록(통계·수정·삭제 등).
 * 로그인한 사용자가 작성자 본인일 때만 렌더링되며, postId가 있는 액션(수정)은
 * `/write/{postId}` 링크로, 그 외에는 목적지 없는 버튼으로 렌더링된다.
 *
 * @param {object} props
 * @param {string|number|null} props.authorUserId - 게시글 작성자 ID.
 * @param {string|number} [props.postId] - 게시글 ID. 수정 링크 생성에 사용된다.
 * @param {string[]} [props.actions] - 표시할 액션 라벨 목록.
 * @returns {JSX.Element|null} 작성자 전용 액션 버튼 그룹, 작성자가 아니면 null.
 */
export function AdminActions({ authorUserId, postId, actions = [] }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);

  if (!isLoggedIn || user?.userId !== authorUserId) return null;

  return (
    <div className="inline-flex flex-nowrap items-center gap-1 rounded-full border border-border bg-card p-1">
      {actions.map((action) => {
        const buildHref = ACTION_HREF_BUILDERS[action];
        const href = postId != null ? buildHref?.(postId) : null;

        if (href) {
          return (
            <Button key={action} variant="ghost" size="sm" className="rounded-full px-4" render={<Link href={href} />}>
              {action}
            </Button>
          );
        }

        return (
          <Button key={action} type="button" variant="ghost" size="sm" className="rounded-full px-4">
            {action}
          </Button>
        );
      })}
    </div>
  );
}

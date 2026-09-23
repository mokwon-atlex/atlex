'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button, buttonVariants } from '@/components/common/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog';
import { useDeletePost } from '@/hooks/queries/posts/useDeletePost';
import { cn } from '@/lib/utils';

// postId 를 알아야 이동시킬 수 있는 액션들의 경로 매핑.
// '통계' 등 아직 목적지가 없는 액션은 여기 없으면 기존처럼 버튼만 렌더링된다.
// '삭제'는 확인 모달을 여는 별도 흐름으로 처리한다.
const ACTION_HREF_BUILDERS = {
  수정: (postId) => `/write/${postId}`,
};

/**
 * 게시글 작성자 전용 액션 바 컴포넌트(통계·수정·삭제 등).
 * 로그인한 사용자가 작성자 본인일 때만 렌더링되며, 수정은 `/write/{postId}` 링크로,
 * 삭제는 확인 모달을 통한 안전한 삭제 흐름으로, 그 외에는 목적지 없는 버튼으로 렌더링된다.
 *
 * @param {object} props
 * @param {string|number|null} props.authorUserId - 게시글 작성자 ID.
 * @param {string|number} [props.postId] - 게시글 ID. 수정 링크 생성 및 삭제에 사용된다.
 * @param {string[]} [props.actions] - 표시할 액션 라벨 목록 (기본: []).
 * @param {(postId: string | number) => Promise<void>} [props.onDelete] - 커스텀 삭제 핸들러 (미지정 시 useDeletePost 호출)
 * @param {() => void} [props.onDeleteSuccess] - 삭제 성공 시 콜백 (미지정 시 작성자 블로그 홈으로 이동)
 * @param {(error: Error) => void} [props.onDeleteError] - 삭제 실패 시 콜백
 * @returns {JSX.Element|null} 작성자 전용 액션 버튼 그룹, 작성자가 아니면 null.
 */
export function AdminActions({ authorUserId, postId, actions = [], onDelete, onDeleteSuccess, onDeleteError }) {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const deletePostMutation = useDeletePost();
  const isDeleting = isSubmitting || deletePostMutation.isPending;

  if (!isLoggedIn || user?.userId !== authorUserId) return null;

  function handleOpenConfirm() {
    setErrorMessage('');
    setIsConfirmOpen(true);
  }

  function handleOpenChange(open) {
    // 삭제 처리 중에는 모달을 닫을 수 없도록 방어
    if (isDeleting) return;
    setIsConfirmOpen(open);
    if (!open) {
      setErrorMessage('');
    }
  }

  async function handleConfirmDelete() {
    if (isDeleting) return;

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (onDelete) {
        await onDelete(postId);
      } else if (postId) {
        await deletePostMutation.mutateAsync(postId);
      }

      setIsConfirmOpen(false);

      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        const destination = authorUserId ? `/@${authorUserId}` : '/';
        router.push(destination);
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || '게시글 삭제에 실패했습니다. 다시 시도해 주세요.';
      setErrorMessage(message);
      if (onDeleteError) {
        onDeleteError(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="inline-flex flex-nowrap items-center gap-1 rounded-full border border-border bg-card p-1">
        {actions.map((action) => {
          if (action === '삭제') {
            return (
              <Button
                key={action}
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full px-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleOpenConfirm}
              >
                {action}
              </Button>
            );
          }

          const buildHref = ACTION_HREF_BUILDERS[action];
          const href = postId != null ? buildHref?.(postId) : null;

          if (href) {
            return (
              // 페이지 이동이므로 버튼이 아닌 링크 시맨틱을 유지하고 스타일만 버튼과 맞춘다.
              <Link
                key={action}
                href={href}
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'rounded-full px-4')}
              >
                {action}
              </Link>
            );
          }

          return (
            <Button key={action} type="button" variant="ghost" size="sm" className="rounded-full px-4">
              {action}
            </Button>
          );
        })}
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={handleOpenChange}>
        <DialogContent variant="destructive" size="default">
          <DialogHeader>
            <DialogTitle>게시글을 삭제하시겠습니까?</DialogTitle>
            <DialogDescription>삭제된 게시글은 복구할 수 없습니다. 정말로 삭제하시겠습니까?</DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <p className="text-sm font-medium text-destructive" role="alert">
              {errorMessage}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isDeleting}>
              취소
            </Button>
            <Button type="button" variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

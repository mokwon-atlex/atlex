'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog';
import { useDeletePost } from '@/hooks/queries/posts/useDeletePost';

/**
 * 게시글 관리자 전용 액션 바 컴포넌트입니다.
 * 작성자 본인에게만 노출되며, 게시글 삭제 시 확인 모달을 통한 안전한 삭제 흐름을 제공합니다.
 *
 * @param {object} props
 * @param {string} props.authorUserId - 작성자의 유저 ID
 * @param {string | number} [props.postId] - 게시글 ID
 * @param {string[]} [props.actions] - 액션 버튼 목록 (기본: [])
 * @param {(postId: string | number) => Promise<void>} [props.onDelete] - 커스텀 삭제 핸들러 (미지정 시 useDeletePost 호출)
 * @param {() => void} [props.onDeleteSuccess] - 삭제 성공 시 콜백 (미지정 시 작성자 블로그 홈으로 이동)
 * @param {(error: Error) => void} [props.onDeleteError] - 삭제 실패 시 콜백
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

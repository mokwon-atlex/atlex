'use client';

// 게시물·댓글의 신고 버튼. 클릭하면 신고 다이얼로그를 연다.

import { useEffect, useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { ReportDialog } from '@/components/domain/report/ui/ReportDialog';

/**
 * 로그인한 사용자가 타인의 게시물·댓글을 신고할 수 있는 버튼.
 * 미로그인 사용자와 작성자 본인에게는 렌더링하지 않는다(서버도 본인 신고를 거부한다).
 *
 * @param {object} props
 * @param {'POST'|'COMMENT'} props.targetType - 신고 대상 종류
 * @param {number|string} props.targetId - 신고 대상 ID
 * @param {string|null} [props.authorUserId] - 대상 작성자 아이디(본인 여부 판단용)
 * @param {'xs'|'sm'} [props.size] - 버튼 크기
 * @param {string} [props.className] - 추가 클래스
 * @returns {JSX.Element|null} 신고 버튼과 다이얼로그
 */
export function ReportButton({ targetType, targetId, authorUserId, size = 'sm', className }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const currentUserId = useAuthStore((s) => s.user?.userId);
  const [isOpen, setIsOpen] = useState(false);
  // 로그인 상태는 localStorage에서 복원되므로 마운트 이후에만 판단해 서버 렌더 결과와 어긋나지 않게 한다.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isLoggedIn || targetId == null || (authorUserId && currentUserId === authorUserId)) return null;

  const targetLabel = targetType === 'COMMENT' ? '댓글' : '게시글';

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size={size}
        onClick={() => setIsOpen(true)}
        aria-label={`${targetLabel} 신고`}
        className={cn('text-muted-foreground hover:text-destructive', className)}
      >
        <Flag className="size-3.5" aria-hidden="true" />
        <span className="ml-1">신고</span>
      </Button>
      <ReportDialog open={isOpen} onOpenChange={setIsOpen} targetType={targetType} targetId={targetId} />
    </>
  );
}

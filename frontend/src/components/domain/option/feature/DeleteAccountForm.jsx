'use client';

import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/ui/card';

import { Button } from '@/components/common/ui/button';
import { deleteUser } from '@/lib/api/users';
import { useAuthStore } from '@/store/authStore';

/**
 * 회원 탈퇴 카드. 확인 다이얼로그에서 탈퇴를 요청하고, 성공하면 로그인 상태를 비운 뒤 홈으로 이동한다.
 *
 * 백엔드 탈퇴 API는 로그인 세션만 확인하고 별도 입력을 받지 않는다.
 * 탈퇴 시 서버가 refreshToken 을 지우므로 로그아웃 API 를 따로 부르지 않고 로컬 상태만 비운다.
 */
function DeleteAccountForm() {
  const userId = useAuthStore((state) => state.user?.userId);
  const clearAuth = useAuthStore((state) => state.logout);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function handleOpenChange(nextOpen) {
    // 요청 중에는 다이얼로그를 닫지 않아 결과 안내를 놓치지 않게 한다.
    if (isDeleting) return;
    setIsConfirmOpen(nextOpen);
    if (!nextOpen) setErrorMessage('');
  }

  async function handleConfirmDelete() {
    if (!userId) {
      setErrorMessage('로그인 정보를 확인할 수 없습니다.');
      return;
    }

    setIsDeleting(true);
    setErrorMessage('');
    try {
      await deleteUser(userId);
      clearAuth();
      // 설정 화면의 RequireAuth 가 로그아웃을 감지해 /account 로 보내는 것보다 앞서도록
      // 클라이언트 라우터 대신 문서 이동으로 홈에 보낸다.
      window.location.replace('/');
    } catch (error) {
      setErrorMessage(error?.message ?? '회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      setIsDeleting(false);
    }
  }

  return (
    <Card className="rounded-3xl border-destructive/20 bg-card/80 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle className="text-destructive">회원 탈퇴</CardTitle>

        <CardDescription>계정을 삭제하면 복구할 수 없습니다.</CardDescription>
      </CardHeader>

      <CardContent>
        <Button type="button" variant="destructive" onClick={() => setIsConfirmOpen(true)}>
          회원 탈퇴
        </Button>

        <Dialog open={isConfirmOpen} onOpenChange={handleOpenChange}>
          <DialogContent variant="destructive">
            <DialogHeader>
              <DialogTitle>정말 탈퇴하시겠습니까?</DialogTitle>

              <DialogDescription>탈퇴 시 계정 정보와 작성한 게시글은 복구할 수 없습니다.</DialogDescription>
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
                {isDeleting ? '탈퇴 처리 중...' : '탈퇴하기'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export { DeleteAccountForm };

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/common/ui/dialog';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/ui/card';

import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Textarea } from '@/components/common/ui/textarea';
import { Field, FieldLabel } from '@/components/common/ui/field';
import { deleteUser } from '@/lib/api/users';
import { useAuthStore } from '@/store/authStore';

function DeleteAccountForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!user?.userId) {
      setError('로그인 정보를 확인할 수 없습니다.');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteUser(user.userId);
      logout();
      setIsOpen(false);
      router.push('/');
    } catch (err) {
      setError(err?.message ?? '회원 탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="rounded-3xl border-destructive/20 bg-card/80 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle className="text-destructive">회원 탈퇴</CardTitle>

        <CardDescription>계정을 삭제하면 복구할 수 없습니다.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <Field>
          <FieldLabel>탈퇴 사유</FieldLabel>

          <Textarea
            variant="outline"
            resize="none"
            placeholder="탈퇴 사유를 입력해주세요"
            className="min-h-28 rounded-2xl"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>



        {error ? (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button variant="destructive" />}>회원 탈퇴</DialogTrigger>

          <DialogContent variant="destructive">
            <DialogHeader>
              <DialogTitle>정말 탈퇴하시겠습니까?</DialogTitle>

              <DialogDescription>탈퇴 시 계정 정보와 작성한 일부 데이터는 복구할 수 없습니다.</DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>취소</DialogClose>

              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
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

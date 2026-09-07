"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/common/ui/dialog"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card"

import { Button } from "@/components/common/ui/button"
import { Input } from "@/components/common/ui/input"
import { Textarea } from "@/components/common/ui/textarea"
import { Field, FieldLabel } from "@/components/common/ui/field"

function DeleteAccountForm() {
  return (
    <Card className="rounded-3xl border-destructive/20 bg-card/80 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle className="text-destructive">
          회원 탈퇴
        </CardTitle>

        <CardDescription>
          계정을 삭제하면 복구할 수 없습니다.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <Field>
          <FieldLabel>탈퇴 사유</FieldLabel>

          <Textarea
            variant="outline"
            resize="none"
            placeholder="탈퇴 사유를 입력해주세요"
            className="min-h-28 rounded-2xl"
          />
        </Field>

        <Field>
          <FieldLabel>비밀번호 확인</FieldLabel>

          <Input
            type="password"
            variant="outline"
            size="lg"
            placeholder="비밀번호 입력"
            className="h-11 rounded-xl"
          />
        </Field>

        <Dialog>
          <DialogTrigger render={<Button variant="destructive" />}>
            회원 탈퇴
          </DialogTrigger>

          <DialogContent variant="destructive">
            <DialogHeader>
              <DialogTitle>
                정말 탈퇴하시겠습니까?
              </DialogTitle>

              <DialogDescription>
                탈퇴 시 계정 정보와 작성한 일부 데이터는 복구할 수 없습니다.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline">
                취소
              </Button>

              <Button variant="destructive">
                탈퇴하기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export { DeleteAccountForm }
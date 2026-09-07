"use client"

import { Field, FieldLabel, FieldError } from "@/components/common/ui/field"
import { Input } from "@/components/common/ui/input"
import { Button } from "@/components/common/ui/button"

export function NicknameField({ value, onChange, onBlur, onCheckDuplicate, checkResult, error }) {
  const isInvalid = !!error || checkResult?.ok === false

  return (
    <Field data-invalid={isInvalid || undefined}>
      <FieldLabel>닉네임</FieldLabel>
      <div className="flex gap-2">
        <Input
          type="text"
          variant="outline"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="닉네임을 입력하세요"
          aria-invalid={isInvalid || undefined}
          className="flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={onCheckDuplicate}
          className="shrink-0"
        >
          중복확인
        </Button>
      </div>

      {checkResult && (
        <p className={`text-sm ${checkResult.ok ? "text-green-600" : "text-destructive"}`}>
          {checkResult.message}
        </p>
      )}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

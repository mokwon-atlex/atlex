"use client"

import { Field, FieldLabel, FieldError } from "@/components/common/ui/field"
import { Input } from "@/components/common/ui/input"
import { Button } from "@/components/common/ui/button"

export function UserIdField({ value, onChange, onBlur, onCheckDuplicate, checkResult, error, disabled, showCheckButton = true }) {
  const isInvalid = !!error || checkResult?.ok === false

  return (
    <Field data-invalid={isInvalid || undefined}>
      <FieldLabel>아이디</FieldLabel>
      <div className="flex gap-2">
        <Input
          type="text"
          variant="outline"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="아이디를 입력하세요"
          aria-invalid={isInvalid || undefined}
          className="flex-1"
          disabled={disabled}
        />
        {showCheckButton && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCheckDuplicate}
            className="shrink-0"
            disabled={disabled}
          >
            중복확인
          </Button>
        )}
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

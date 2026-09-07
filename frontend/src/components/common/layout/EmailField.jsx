"use client"

import { Field, FieldLabel, FieldError } from "@/components/common/ui/field"
import { Input } from "@/components/common/ui/input"

const EMAIL_DOMAINS = [
  { label: "직접 입력", value: "" },
  { label: "naver.com", value: "naver.com" },
  { label: "daum.net", value: "daum.net" },
  { label: "kakao.com", value: "kakao.com" },
  { label: "gmail.com", value: "gmail.com" },
  { label: "nate.com", value: "nate.com" },
]

export function EmailField({ localValue, domainValue, onLocalChange, onDomainChange, selectedDomain, onSelectedDomainChange, error }) {
  const isInvalid = !!error
  const isDirect = selectedDomain === ""

  function handleSelectChange(e) {
    const value = e.target.value
    onSelectedDomainChange(value)
    onDomainChange({ target: { value } })
  }

  return (
    <Field data-invalid={isInvalid || undefined}>
      <FieldLabel>이메일</FieldLabel>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          variant="outline"
          size="lg"
          value={localValue}
          onChange={onLocalChange}
          aria-invalid={isInvalid || undefined}
          className="flex-1"
        />
        <span className="shrink-0 text-sm text-muted-foreground">@</span>
        <Input
          type="text"
          variant="outline"
          size="lg"
          value={domainValue}
          onChange={onDomainChange}
          placeholder="직접 입력"
          disabled={!isDirect}
          aria-invalid={isInvalid || undefined}
          className="flex-1"
        />
        <select
          value={selectedDomain}
          onChange={handleSelectChange}
          className="h-8 shrink-0 rounded-lg border-2 border-border bg-transparent px-2.5 text-sm text-foreground outline-none focus:border-ring"
        >
          {EMAIL_DOMAINS.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Field, FieldError, FieldLabel } from "@/components/common/ui/field"
import { Input } from "@/components/common/ui/input"

const PASSWORD_CHECKS = [
  { key: "length", label: "10자 이상" },
  { key: "lower", label: "영문 소문자" },
  { key: "upper", label: "영문 대문자" },
  { key: "number", label: "숫자" },
  { key: "special", label: "특수문자" },
]

export function PasswordField({
  value,
  onChange,
  confirmValue = "",
  onConfirmChange,
  checks,
  error,
  showConfirm = true,
  showChecks = true,
  label = "비밀번호",
  placeholder = "비밀번호 입력",
  confirmPlaceholder = "비밀번호 확인",
  successMessage = "",
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordMatch = confirmValue.length > 0 && value === confirmValue
  const passwordMismatch = confirmValue.length > 0 && value !== confirmValue

  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel>{label}</FieldLabel>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <Input
            type="text"
            variant="outline"
            size="lg"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            aria-invalid={!!error || undefined}
            className={`h-10 rounded-lg pr-10 ${
              showPassword ? "" : "[-webkit-text-security:disc]"
            }`}
          />

          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {showConfirm && (
          <div className="relative">
            <Input
              type="text"
              variant="outline"
              size="lg"
              value={confirmValue}
              onChange={onConfirmChange}
              placeholder={confirmPlaceholder}
              aria-invalid={passwordMismatch || undefined}
              className={`h-10 rounded-lg pr-10 ${
                showConfirmPassword ? "" : "[-webkit-text-security:disc]"
              } ${
                passwordMatch
                  ? "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/50"
                  : ""
              }`}
            />

            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        )}
      </div>

      {showChecks && checks && (
        <ul className="flex flex-wrap gap-3 text-xs">
          {PASSWORD_CHECKS.map(({ key, label: checkLabel }) => (
            <li
              key={key}
              className={`flex items-center gap-1 ${
                checks[key] ? "text-green-600" : "text-destructive"
              }`}
            >
              <span aria-hidden="true">*</span>
              {checkLabel}
            </li>
          ))}
        </ul>
      )}

      {!error && passwordMatch && (!checks || Object.values(checks).every(Boolean)) && successMessage ? (  
        <p className="text-sm text-emerald-600">{successMessage}</p>  
      ) : null}

      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

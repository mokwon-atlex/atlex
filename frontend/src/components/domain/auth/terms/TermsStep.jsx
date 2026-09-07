"use client"

import { useState } from "react"

import { Button } from "@/components/common/ui/button"
import { Checkbox } from "@/components/common/ui/checkbox"
import { Textfield } from "@/components/common/ui/textfield"

function TermsStep({ onNext, onBack }) {
  const [terms, setTerms] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [marketing, setMarketing] = useState(false)

  const allChecked = terms && privacy && marketing
  const requiredChecked = terms && privacy

  function handleAllChange() {
    const next = !allChecked
    setTerms(next)
    setPrivacy(next)
    setMarketing(next)
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-4">
          <Checkbox
            className="mt-0.5"
            checked={allChecked}
            onCheckedChange={handleAllChange}
          />
          <div>
            <Textfield weight="bold">모두 동의합니다.</Textfield>
            <Textfield variant="muted" size="sm" className="mt-1 leading-5">
              이용약관, 개인정보 수집 및 이용, 마케팅 정보 수신에 모두 동의합니다.
            </Textfield>
          </div>
        </label>

        <div className="border-t border-border/60" />

        <div className="space-y-2">
          <TermsItem
            label="이용약관 동의"
            badge="필수"
            badgeClass="text-destructive"
            checked={terms}
            onCheckedChange={(v) => setTerms(v === true)}
            scrollContent="Atlex 서비스 이용을 위한 기본 약관입니다."
          />

          <TermsItem
            label="개인정보 수집 및 이용 안내"
            badge="필수"
            badgeClass="text-destructive"
            checked={privacy}
            onCheckedChange={(v) => setPrivacy(v === true)}
            scrollContent="최소한의 개인정보를 수집합니다."
          />

          <TermsItem
            label="마케팅 정보 수신 동의"
            badge="선택"
            badgeClass="text-muted-foreground"
            checked={marketing}
            onCheckedChange={(v) => setMarketing(v === true)}
            description="이벤트 및 혜택 정보를 받아볼 수 있습니다."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-10 flex-1 rounded-lg text-sm font-bold"
        >
          취소
        </Button>

        <Button
          type="button"
          disabled={!requiredChecked}
          onClick={onNext}
          className="h-10 flex-1 rounded-lg text-sm font-bold"
        >
          다음
        </Button>
      </div>
    </div>
  )
}

function TermsItem({ label, badge, badgeClass, checked, onCheckedChange, scrollContent, description }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-4">
      <label className="flex cursor-pointer items-center gap-3">
        <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
        <span className="text-sm font-semibold text-foreground">
          {label}
          <span className={`ml-2 text-xs font-medium ${badgeClass}`}>({badge})</span>
        </span>
      </label>

      {scrollContent && (
        <div className="mt-3 h-20 overflow-y-auto rounded-lg bg-muted/50 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
          {scrollContent}
        </div>
      )}

      {description && (
        <p className="mt-2 pl-7 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

export { TermsStep }

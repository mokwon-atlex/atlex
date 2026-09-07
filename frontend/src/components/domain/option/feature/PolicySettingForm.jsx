import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

const POLICIES = [
  {
    title: "이용 약관",
    description: "서비스 이용 조건과 회원의 권리 및 의무를 확인합니다.",
  },
  {
    title: "개인정보처리방침",
    description: "개인정보 수집, 이용, 보관 및 보호 기준을 확인합니다.",
  },
  {
    title: "쿠키 정책",
    description: "쿠키 사용 목적과 관리 방법을 확인합니다.",
  },
  {
    title: "운영 정책",
    description: "서비스 운영 기준과 제한 사항을 확인합니다.",
  },
  {
    title: "청소년 보호 정책",
    description: "청소년 이용자 보호를 위한 정책을 확인합니다.",
  },
]

function PolicySettingForm() {
  return (
    <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>서비스 정책</CardTitle>

        <CardDescription>
          Atlex 서비스 이용과 관련된 정책을 확인할 수 있습니다.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {POLICIES.map((policy) => (
          <Link
            key={policy.title}
            href="/policy"
            className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-muted/30 px-5 py-4 text-left transition-colors hover:bg-muted/60"
          >
            <span>
              <span className="block text-sm font-semibold text-foreground">
                {policy.title}
              </span>

              <span className="mt-1 block text-sm text-muted-foreground">
                {policy.description}
              </span>
            </span>

            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

export { PolicySettingForm }

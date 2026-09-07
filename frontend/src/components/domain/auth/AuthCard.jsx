"use client"

import { Textfield } from "@/components/common/ui/textfield"
import { LoginLogo } from "@/components/domain/auth/login/feature/LoginLogo"
import { LoginForm } from "@/components/domain/auth/login/feature/LoginForm"
import { SignupForm } from "@/components/domain/auth/signup/feature/SignupForm"
import { TermsStep } from "@/components/domain/auth/terms/TermsStep"

const HEADER = {
  login: {
    title: "로그인",
    description: "Atlex 계정으로 로그인하고 더 많은 기능을 이용해보세요.",
  },
  terms: {
    title: "약관 동의",
    description: "서비스 이용을 위해 아래 약관을 확인해 주세요.",
  },
  signup: {
    title: "회원가입",
    description: "Atlex 계정을 생성하고 그래프 기반 블로그를 시작해보세요.",
  },
}

function AuthCard({ mode, onModeChange }) {
  const { title, description } = HEADER[mode] ?? HEADER.login

  return (
    <section className="flex items-center justify-center py-6">
      <div className="w-full rounded-3xl border border-border/60 bg-background p-6 lg:p-8">
        <LoginLogo />

        <div className="mt-6 border-b border-border/60 pb-5">
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            {title}
          </h2>

          <Textfield variant="muted" size="sm" className="mt-2 leading-6">
            {description}
          </Textfield>
        </div>

        {mode === "login" && (
          <LoginForm onSwitchMode={() => onModeChange("terms")} />
        )}

        {mode === "terms" && (
          <TermsStep
            onNext={() => onModeChange("signup")}
            onBack={() => onModeChange("login")}
          />
        )}

        {mode === "signup" && (
          <SignupForm
            onBack={() => onModeChange("terms")}
            onLogin={() => onModeChange("login")}
          />
        )}
      </div>
    </section>
  )
}

export { AuthCard }

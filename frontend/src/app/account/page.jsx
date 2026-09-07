"use client"

import { useState } from "react"

import Header from "@/components/common/layout/Header"
import { AuthHero } from "@/components/domain/auth/AuthHero"
import { AuthCard } from "@/components/domain/auth/AuthCard"

export default function Page() {
  const [mode, setMode] = useState("login")

  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,var(--muted),var(--background)_45%)]">
      <Header />
      <div className="mx-auto flex w-full max-w-content-narrow flex-1 flex-col px-5 pt-7 sm:px-8 lg:px-10">
        <div className="grid flex-1 grid-cols-1 items-center gap-14 py-8 lg:grid-cols-[1.05fr_480px]">
          <AuthHero />
          <AuthCard mode={mode} onModeChange={setMode} />
        </div>
      </div>
    </main>
  )
}

"use client"

import { useState } from "react"

import Header from "@/components/common/layout/Header"
import { OptionSidebar } from "@/components/domain/option/layout/OptionSidebar"
import { OptionContent } from "@/components/domain/option/layout/OptionContent"

export default function Page() {
  const [activeMenu, setActiveMenu] = useState("profile")

  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,var(--muted),var(--background)_45%)]">
      <Header />
      <div className="mx-auto flex w-full max-w-content-narrow flex-1 flex-col px-5 pb-12 pt-7 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <OptionSidebar
            activeMenu={activeMenu}
            onChangeMenu={setActiveMenu}
          />
          <OptionContent activeMenu={activeMenu} />
        </div>
      </div>
    </main>
  )
}
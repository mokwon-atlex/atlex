"use client"

import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/common/ui/button"

export function AdminActions({ authorUserId, actions = [] }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const user = useAuthStore((s) => s.user)

  if (!isLoggedIn || user?.userId !== authorUserId) return null

  return (
    <div className="inline-flex flex-nowrap items-center gap-1 rounded-full border border-border bg-card p-1">
      {actions.map((action) => (
        <Button key={action} type="button" variant="ghost" size="sm" className="rounded-full px-4">
          {action}
        </Button>
      ))}
    </div>
  )
}

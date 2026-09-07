"use client"

import { Share2 } from "lucide-react"
import { Button } from "@/components/common/ui/button"

function ActionButton({ label, count, icon }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-auto justify-between rounded-full gap-3 px-4 xl:w-full"
    >
      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      {count != null && (
        <span className="text-sm font-bold tabular-nums text-foreground">{count}</span>
      )}
      {icon}
    </Button>
  )
}

export default function BlogDetailActionRail({ bookmarks = 7, likes = 18 }) {
  return (
    <div className="flex flex-wrap gap-2 xl:w-fit xl:flex-col">
      <ActionButton label="Like" count={likes} />
      <ActionButton label="Save" count={bookmarks} />
      <ActionButton label="Share" icon={<Share2 className="size-3.5 text-muted-foreground" />} />
    </div>
  )
}

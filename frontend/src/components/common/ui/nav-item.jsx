import * as React from "react"
import { cn } from "@/lib/utils"

function NavItem({ className, isActive, children, ...props }) {
  return (
    <li
      className={cn(
        "group cursor-pointer rounded-md p-2 transition-all hover:bg-muted/50",
        isActive ? "bg-muted/30" : "",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "text-sm transition-colors",
          isActive
            ? "font-bold text-foreground"
            : "font-medium text-muted-foreground/60 group-hover:text-muted-foreground"
        )}
      >
        {children}
      </span>
    </li>
  )
}

export { NavItem }

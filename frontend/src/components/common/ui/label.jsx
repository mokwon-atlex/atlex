"use client"

import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "flex items-center gap-2 leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-foreground",
        muted:   "text-muted-foreground font-normal",
      },
      size: {
        sm:      "text-xs",
        default: "text-sm",
        lg:      "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Label({
  className,
  variant,
  size,
  ...props
}) {
  return (
    <label
      data-slot="label"
      className={cn(labelVariants({ variant, size }), className)}
      {...props} />
  )
}

export { Label, labelVariants }

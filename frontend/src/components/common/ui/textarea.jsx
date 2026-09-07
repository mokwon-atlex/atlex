import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex field-sizing-content min-h-16 w-full rounded-lg text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default:
          "border border-border bg-transparent px-2.5 py-2 focus-visible:border-ring dark:bg-input/30 disabled:bg-input/50 dark:disabled:bg-input/80",
        outline:
          "border-2 border-border bg-transparent px-2.5 py-2 focus-visible:border-ring dark:bg-input/30 disabled:bg-input/50 dark:disabled:bg-input/80",
        filled:
          "border border-transparent bg-muted px-2.5 py-2 focus-visible:border-ring focus-visible:bg-transparent disabled:bg-muted/50",
        ghost:
          "border-0 bg-transparent px-0 py-1 focus-visible:ring-0 focus-visible:border-b focus-visible:border-ring rounded-none disabled:opacity-40",
      },
      resize: {
        none:       "resize-none",
        vertical:   "resize-y",
        horizontal: "resize-x",
        both:       "resize",
      },
    },
    defaultVariants: {
      variant: "default",
      resize: "vertical",
    },
  }
)

function Textarea({
  className,
  variant,
  resize,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant, resize }), className)}
      {...props} />
  )
}

export { Textarea, textareaVariants }

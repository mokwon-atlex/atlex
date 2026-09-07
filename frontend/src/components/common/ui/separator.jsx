"use client"

import { cva } from "class-variance-authority"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"

const separatorVariants = cva(
  "shrink-0 data-horizontal:w-full data-vertical:self-stretch",
  {
    variants: {
      variant: {
        default: "bg-border data-horizontal:h-px data-vertical:w-px",
        muted:   "bg-border/40 data-horizontal:h-px data-vertical:w-px",
        thick:   "bg-border data-horizontal:h-0.5 data-vertical:w-0.5",
        dashed:
          "bg-transparent data-horizontal:h-px data-vertical:w-px data-horizontal:[background-image:repeating-linear-gradient(to_right,theme(colors.border)_0,theme(colors.border)_4px,transparent_4px,transparent_8px)] data-vertical:[background-image:repeating-linear-gradient(to_bottom,theme(colors.border)_0,theme(colors.border)_4px,transparent_4px,transparent_8px)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Separator({
  className,
  variant,
  orientation = "horizontal",
  ...props
}) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(separatorVariants({ variant }), className)}
      {...props} />
  )
}

export { Separator, separatorVariants }

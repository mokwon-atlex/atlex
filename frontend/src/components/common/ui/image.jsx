import * as React from "react"
import { cva } from "class-variance-authority"
import { ImageIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const imageVariants = cva(
  "flex items-center justify-center border border-dashed bg-muted/30 text-muted-foreground transition-colors",
  {
    variants: {
      shape: {
        sharp: "rounded-none",
        square: "rounded-xl",
        circle: "rounded-full",
      },

      size: {
        sm: "h-28 w-28",
        default: "h-40 w-40",
        lg: "h-52 w-52",
        wide: "h-40 w-72",
      },
    },

    defaultVariants: {
      shape: "square",
      size: "default",
    },
  }
)

function Image({
  className,
  shape,
  size,
  icon,
  ...props
}) {
  return (
    <div
      data-slot="image"
      className={cn(
        imageVariants({ shape, size }),
        className
      )}
      {...props}
    >
      {icon ?? <ImageIcon className="size-8" />}
    </div>
  )
}

export { Image, imageVariants }
import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textfieldVariants = cva(
  "text-sm text-foreground",
  {
    variants: {
      variant: {
        default: "",
        muted: "text-muted-foreground",
        primary: "text-primary",
        destructive: "text-destructive",
      },

      size: {
        xs: "text-xs",
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      },

      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },

      whitespace: {
        normal: "whitespace-normal",
        nowrap: "whitespace-nowrap",
        preline: "whitespace-pre-line",
        prewrap: "whitespace-pre-wrap",
        keep: "whitespace-normal [word-break:keep-all] [overflow-wrap:normal]",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      weight: "normal",
      whitespace: "keep",
    },
  }
)

function Textfield({
  className,
  variant,
  size,
  weight,
  whitespace,
  children,
  ...props
}) {
  return (
    <p
      data-slot="textfield"
      className={cn(
        textfieldVariants({
          variant,
          size,
          weight,
          whitespace,
        }),
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

export { Textfield, textfieldVariants }
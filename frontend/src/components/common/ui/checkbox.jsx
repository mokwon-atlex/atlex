"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

const checkboxVariants = cva(
  "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] transition-colors outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 group-data-[disabled=true]/field:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-disabled:data-checked:border-primary/70 data-disabled:data-checked:bg-primary/70 dark:data-checked:bg-primary",
  {
    variants: {
      variant: {
        default:
          "border border-border bg-background data-disabled:bg-muted/20 dark:bg-input/30 dark:data-disabled:bg-input/50",
        outline:
          "border-2 border-border bg-background data-disabled:bg-muted/20 dark:bg-input/30 dark:data-disabled:bg-input/50",
        filled:
          "border border-transparent bg-muted data-checked:border-primary data-disabled:bg-muted/80 dark:bg-input dark:data-disabled:bg-input/80",
        ghost:
          "border border-border/70 bg-transparent data-disabled:bg-muted/20 hover:bg-muted/60 data-checked:border-primary/20 data-checked:bg-primary/10 data-checked:text-primary dark:border-border/60 dark:data-disabled:bg-muted/20 dark:data-checked:border-primary/30 dark:data-checked:bg-primary/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Checkbox({
  className,
  variant,
  ...props
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-variant={variant}
      className={cn(
        checkboxVariants({ variant }),
        className
      )}
      {...props}>
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5">
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox, checkboxVariants }

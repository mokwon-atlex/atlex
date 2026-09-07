import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const capsuleVariants = cva(
    "inline-flex items-center justify-center rounded-full border px-3 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {

                default:
                    "border-border bg-muted/50 text-foreground hover:bg-muted/80",

                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",

                outline: "text-foreground border-border bg-transparent",

                ghost: "border-transparent bg-transparent text-muted-foreground px-1",

                success:
                    "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
            },
            size: {
                sm: "h-5 px-2 text-[10px]",
                default: "h-6 px-3",
                lg: "h-7 px-4 text-sm",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

function Capsule({ className, variant, size, ...props }) {
    return (
        <div
            data-slot="capsule"
            className={cn(capsuleVariants({ variant, size }), className)}
            {...props}
        />
    )
}

export { Capsule, capsuleVariants }
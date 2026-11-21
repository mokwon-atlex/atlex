import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'w-full min-w-0 rounded-md text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-sm file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/30',
  {
    variants: {
      variant: {
        default:
          'border border-border bg-background px-2.5 py-1 focus-visible:border-foreground/40 dark:bg-card/70 disabled:bg-muted/50 dark:disabled:bg-muted/40',
        outline:
          'border border-border bg-transparent px-2.5 py-1 focus-visible:border-foreground/50 dark:bg-card/50 disabled:bg-muted/50',
        filled:
          'border border-border/60 bg-muted/70 px-2.5 py-1 focus-visible:border-foreground/40 focus-visible:bg-background dark:bg-muted/50 disabled:bg-muted/40',
        ghost:
          'border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-b focus-visible:border-foreground/50 rounded-none disabled:opacity-40',
      },
      size: {
        sm: 'h-7 px-2 text-xs file:h-5',
        default: 'h-8 file:h-6',
        lg: 'h-10 px-3 text-base file:h-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Input({ className, type, variant, size, ...props }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Input, inputVariants };

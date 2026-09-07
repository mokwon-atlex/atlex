import { Button } from "@/components/common/ui/button";
import { cn } from "@/lib/utils";

const toneClassNameMap = {
  accent:
    "border-primary/25 bg-primary/10 text-foreground hover:bg-primary/10 hover:text-foreground",
  neutral:
    "border-border bg-card text-foreground hover:bg-card hover:text-foreground",
  soft:
    "border-border bg-muted/70 text-foreground hover:bg-muted/70 hover:text-foreground",
  warm:
    "border-border bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground",
};

const sizeClassNameMap = {
  md: "h-11 px-4 text-sm",
  lg: "h-11 px-4 text-sm",
};

const iconOnlySizeClassNameMap = {
  md: "size-9 p-0",
  lg: "size-10 p-0",
};

export default function BlogHomePillButton({
  ariaLabel,
  className,
  icon: Icon,
  iconClassName,
  iconOnly = false,
  label,
  size = "md",
  tone = "neutral",
  ...props
}) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-label={iconOnly ? (ariaLabel ?? label) : ariaLabel}
      className={cn(
        "rounded-full border font-semibold shadow-none",
        toneClassNameMap[tone],
        iconOnly ? iconOnlySizeClassNameMap[size] : sizeClassNameMap[size],
        iconOnly ? "justify-center" : "gap-2",
        className
      )}
      {...props}
    >
      {Icon ? <Icon className={cn("size-4", iconClassName)} /> : null}
      {iconOnly ? null : <span>{label}</span>}
    </Button>
  );
}

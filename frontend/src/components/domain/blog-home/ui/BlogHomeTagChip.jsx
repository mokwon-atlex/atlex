import { Button } from "@/components/common/ui/button";
import { Capsule } from "@/components/common/ui/capsule";
import { cn } from "@/lib/utils";

export default function BlogHomeTagChip({
  active = false,
  count,
  fullWidth = false,
  label,
  onClick,
}) {
  return (
    <Button
      onClick={onClick}
      type="button"
      variant="ghost"
      aria-pressed={active}
      className={cn(
        "h-auto rounded-full p-0 transition-transform hover:bg-transparent hover:text-current",
        active ? "scale-[1.02]" : "",
        fullWidth ? "w-full justify-start" : "w-auto"
      )}
    >
      <Capsule
        variant={active ? "secondary" : "default"}
        className={cn(
          "h-auto w-full gap-3 rounded-full px-4 py-2 text-sm font-semibold transition-all",
          fullWidth ? "justify-between" : "",
          active
            ? "border-primary/30 bg-primary text-primary-foreground ring-1 ring-primary/20 shadow-lg shadow-primary/15 hover:bg-primary hover:text-primary-foreground"
            : "border-border bg-card text-muted-foreground"
        )}
      >
        <span>{label}</span>
        {typeof count === "number" ? (
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors",
              active
                ? "bg-primary-foreground/14 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {count}
          </span>
        ) : null}
      </Capsule>
    </Button>
  );
}

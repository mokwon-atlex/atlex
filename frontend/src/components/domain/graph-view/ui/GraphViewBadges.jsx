import { tagMeta } from "@/components/domain/graph-view/lib/graph-view-utils";
import { cn } from "@/lib/utils";

export function TagPill({ tag }) {
  const meta = tagMeta(tag);

  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-black"
      style={{ background: meta.bg, color: meta.text }}
    >
      {tag}
    </span>
  );
}

export function AuthorBadge({ author, compact = false }) {
  return (
    <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
      <Avatar author={author} size="sm" />
      {compact ? null : author.name}
    </span>
  );
}

export function Avatar({ author, size = "sm" }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-black text-white",
        size === "md" ? "h-6 w-6 text-xs" : "h-5 w-5 text-[10px]"
      )}
      style={{ background: author.avatarColor }}
    >
      {author.initial}
    </span>
  );
}

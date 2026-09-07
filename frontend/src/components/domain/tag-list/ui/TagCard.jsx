import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TagCard({ tag }) {
  const encodedTagName = encodeURIComponent(tag.name);

  return (
    <Link
      href={`/tags/${encodedTagName}`}
      className={cn(
        "cursor-pointer rounded-md border border-border bg-card px-4 py-3",
        "text-card-foreground transition-colors",
        "hover:border-primary/60 hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <p className="text-[15px] font-medium">{tag.name}</p>
      <p className="mt-1 text-[12px] text-muted-foreground">
        {tag.postCount.toLocaleString()}개의 포스트
      </p>
    </Link>
  );
}

import Link from 'next/link';
import { ChevronRight, Hash } from 'lucide-react';

/**
 * 메인 페이지 인기 태그 탐색 바.
 */
export default function BlogMainTagBar({ tags = [] }) {
  if (!tags.length) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 px-4 py-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5">
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground">
          <Hash className="size-3.5 text-primary" />
          인기 태그
        </span>
        <div className="flex items-center gap-1.5">
          {tags.map((tag) => (
            <Link
              key={tag.name}
              href={`/tags/${encodeURIComponent(tag.name)}`}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <span>#{tag.name}</span>
              {tag.postCount > 0 ? <span className="text-[11px] text-muted-foreground">{tag.postCount}</span> : null}
            </Link>
          ))}
        </div>
      </div>

      <Link
        href="/tag_list"
        className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        전체 태그
        <ChevronRight className="size-3.5" />
      </Link>
    </div>
  );
}

import Link from 'next/link';
import { ChevronRight, Hash } from 'lucide-react';

const TAG_LABEL_BY_FILTER = {
  trending: '트렌딩 태그',
  latest: '인기 태그',
  feed: '추천 태그',
};

/**
 * 메인 페이지 필터 툴바 하단의 태그 탐색 바.
 */
export default function BlogMainTagBar({ filterId = 'trending', tags = [] }) {
  if (!tags.length) {
    return null;
  }

  const label = TAG_LABEL_BY_FILTER[filterId] ?? TAG_LABEL_BY_FILTER.trending;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-card/70 px-3.5 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5">
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
          <Hash className="size-3.5 text-primary" />
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {tags.map((tag) => (
            <Link
              key={tag.name}
              href={`/tags/${encodeURIComponent(tag.name)}`}
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border/80 bg-background px-2 py-0.5 text-xs font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-accent"
            >
              <span>#{tag.name}</span>
              {tag.postCount > 0 ? (
                <span className="text-[11px] text-muted-foreground tabular-nums">{tag.postCount}</span>
              ) : null}
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

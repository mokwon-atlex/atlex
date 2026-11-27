import { Link2, Lock } from 'lucide-react';

import { AuthorBadge, TagPill } from '@/components/domain/graph-view/ui/GraphViewBadges';

/** 선택한 노드 근처에서 연결선을 피해 게시글 요약과 연결 정보를 컴팩트하게 보여 주는 미리보기 카드다. */
export function NodePopup({ connectionCount = 0, position, post }) {
  const visibleTags = post.tags.slice(0, 4);
  const hiddenTagCount = Math.max(post.tags.length - visibleTags.length, 0);

  return (
    <div
      className="pointer-events-none absolute z-50 overflow-hidden rounded-xl border border-border/80 bg-card/95 p-3.5 shadow-lg backdrop-blur-md dark:shadow-black/40"
      data-node-popup
      style={{
        left: position.x,
        maxHeight: position.maxHeight ?? 172,
        top: position.y,
        width: position.width ?? 248,
      }}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-bold text-muted-foreground">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate rounded-md bg-muted px-2 py-0.5 text-foreground/85">
            {post.categoryName ? `${post.categoryName} 카테고리` : '미분류'}
          </span>
          {post.isPrivate ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 text-muted-foreground" title="나만 보기">
              <Lock className="size-3" />
            </span>
          ) : null}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-primary">
          <Link2 className="size-3" />
          연결 {connectionCount}
        </span>
      </div>

      <h3 className="mb-2 line-clamp-2 text-sm font-black leading-snug text-foreground">{post.title}</h3>

      <div className="flex flex-wrap items-center gap-1.5">
        <AuthorBadge author={post.author} />
        {visibleTags.map((tag) => (
          <TagPill key={tag} tag={tag} />
        ))}
        {hiddenTagCount > 0 ? (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
            +{hiddenTagCount}
          </span>
        ) : null}
      </div>
    </div>
  );
}

import { Link2, Lock } from 'lucide-react';

import { AuthorBadge, TagPill } from '@/components/domain/graph-view/ui/GraphViewBadges';

/** 선택한 노드 근처에 게시글 요약과 연결 정보를 컴팩트하게 보여 주는 미리보기 카드다. */
export function NodePopup({ connectionCount = 0, position, post }) {
  const visibleTags = post.tags.slice(0, 4);
  const hiddenTagCount = Math.max(post.tags.length - visibleTags.length, 0);

  return (
    <div
      className="pointer-events-none absolute z-50 overflow-hidden rounded-xl border border-border/80 bg-card/95 p-3.5 shadow-lg backdrop-blur-md dark:shadow-black/40"
      data-node-popup
      style={{
        left: position.x,
        maxHeight: position.maxHeight ?? 200,
        top: position.y,
        width: position.width ?? 256,
      }}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-bold text-muted-foreground">
        <span className="truncate rounded-md bg-muted px-2 py-0.5 text-foreground/85">
          {post.categoryName ? `${post.categoryName} 카테고리` : '미분류'}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-primary">
          <Link2 className="size-3" />
          연결 {connectionCount}
        </span>
      </div>

      <h3 className="mb-2 line-clamp-2 text-sm font-black leading-snug text-foreground">{post.title}</h3>

      <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
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

      <div className="flex items-center justify-between border-t border-border/80 pt-2 text-[11px]">
        {post.isPrivate ? (
          <span className="flex items-center gap-1 font-bold text-muted-foreground">
            <Lock className="size-3" /> 나만 보기
          </span>
        ) : (
          <span className="font-bold text-muted-foreground">드래그로 재배치</span>
        )}
        <span className="font-black text-primary">클릭해 읽기 →</span>
      </div>
    </div>
  );
}

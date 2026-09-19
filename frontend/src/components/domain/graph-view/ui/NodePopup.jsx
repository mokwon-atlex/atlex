import { BookOpen, Lock } from 'lucide-react';

import { nodeColor } from '@/lib/graph-view/graph-view-utils';
import { AuthorBadge, TagPill } from '@/components/domain/graph-view/ui/GraphViewBadges';

/** 선택한 게시글의 API 제공 정보를 간단히 보여 주는 팝업이다. */
export function NodePopup({ position, post }) {
  const color = nodeColor(post);

  return (
    <div
      data-node-popup
      className="pointer-events-none absolute z-50 overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-slate-900/15"
      style={{
        left: position.x,
        maxHeight: position.maxHeight ?? 330,
        top: position.y,
        width: position.width ?? 288,
      }}
    >
      <div className="flex h-24 items-center justify-center" style={{ background: `${color}18` }}>
        <BookOpen className="size-9" style={{ color, opacity: 0.72 }} />
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-sm font-black leading-snug text-foreground">{post.title}</h3>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <AuthorBadge author={post.author} />
          {post.tags.slice(0, 1).map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>
        <p className="mb-3 line-clamp-2 text-xs font-bold leading-relaxed text-muted-foreground">
          {post.categoryName ? `${post.categoryName} 카테고리 게시글` : '게시글 관계 그래프 노드'}
        </p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {post.tags.slice(1).map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          {post.isPrivate ? (
            <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
              <Lock className="size-3" /> 나만 보기
            </span>
          ) : (
            <span className="text-xs font-bold text-muted-foreground">공개 게시글</span>
          )}
          <span className="text-xs font-black text-primary">노드 클릭해 읽기 →</span>
        </div>
      </div>
    </div>
  );
}

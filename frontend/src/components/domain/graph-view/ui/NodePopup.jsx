import { BookOpen, Eye, Heart, Lock } from "lucide-react";

import { nodeColor } from "@/components/domain/graph-view/lib/graph-view-utils";
import { AuthorBadge, TagPill } from "@/components/domain/graph-view/ui/GraphViewBadges";

export function NodePopup({ position, post }) {
  const color = nodeColor(post);

  return (
    <div
      className="pointer-events-none absolute z-50 overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-slate-900/15"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, 16px)",
        width: 288,
      }}
    >
      <div
        className="flex h-24 items-center justify-center"
        style={{ background: `${color}18` }}
      >
        <BookOpen className="size-9" style={{ color, opacity: 0.72 }} />
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-sm font-black leading-snug text-foreground">
          {post.title}
        </h3>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <AuthorBadge author={post.author} />
          {post.tags.slice(0, 1).map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>
        <p className="mb-3 line-clamp-2 text-xs font-bold leading-relaxed text-muted-foreground">
          {post.excerpt}
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
            <span className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="size-3" />
                {post.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="size-3" />
                {post.likes}
              </span>
            </span>
          )}
          <span className="text-xs font-black text-primary">읽기 →</span>
        </div>
      </div>
    </div>
  );
}

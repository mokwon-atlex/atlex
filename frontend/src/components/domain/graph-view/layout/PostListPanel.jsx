"use client";

import { useMemo, useState } from "react";
import { Lock, Search } from "lucide-react";

import { AuthorBadge, TagPill } from "@/components/domain/graph-view/ui/GraphViewBadges";
import { cn } from "@/lib/utils";

export function PostListPanel({ onSelect, posts, selectedId }) {
  const [query, setQuery] = useState("");
  const filteredPosts = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
      return posts;
    }

    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(trimmed) ||
        post.author.name.toLowerCase().includes(trimmed) ||
        post.tags.some((tag) => tag.toLowerCase().includes(trimmed))
    );
  }, [posts, query]);

  return (
    <aside className="flex w-[22rem] shrink-0 flex-col border-l border-border bg-card shadow-sm">
      <div className="border-b border-border p-4">
        <label className="flex items-center gap-2 rounded-lg bg-muted/45 px-3 py-2.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-muted-foreground"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="제목, 태그, 작성자 검색"
            value={query}
          />
        </label>
      </div>
      <p className="px-4 py-3 text-xs font-bold text-muted-foreground">
        전체 {filteredPosts.length}개
      </p>
      <div className="flex-1 divide-y divide-border overflow-y-auto">
        {filteredPosts.map((post) => {
          const selected = selectedId === post.id;

          return (
            <button
              key={post.id}
              type="button"
              className={cn(
                "w-full px-4 py-4 text-left transition-colors hover:bg-muted/45",
                selected ? "bg-primary/10" : ""
              )}
              onClick={() => onSelect(post.id)}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <p
                  className={cn(
                    "text-sm font-black leading-snug",
                    selected ? "text-primary" : "text-foreground"
                  )}
                >
                  {post.title}
                </p>
                {post.isPrivate ? (
                  <Lock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <AuthorBadge author={post.author} />
                {post.tags.slice(0, 2).map((tag) => (
                  <TagPill key={tag} tag={tag} />
                ))}
                {post.tags.length > 2 ? (
                  <span className="text-xs font-bold text-muted-foreground">
                    +{post.tags.length - 2}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { tagMeta } from "@/components/domain/graph-view/lib/graph-view-utils";
import { Avatar } from "@/components/domain/graph-view/ui/GraphViewBadges";
import {
  FilterIcon,
  MiniConnectionIcon,
} from "@/components/domain/graph-view/ui/GraphViewIcons";
import { PRIMARY } from "@/components/domain/graph-view/lib/graph-view-utils";

export function FilterSidebar({
  activeAuthors,
  activeTags,
  authors,
  minSharedTags,
  resetFilters,
  setMinSharedTags,
  setShowExplicitEdges,
  setShowTagEdges,
  showExplicitEdges,
  showTagEdges,
  stats,
  tagCounts,
  toggleAuthor,
  toggleTag,
}) {
  const [openConnection, setOpenConnection] = useState(true);
  const [openAuthors, setOpenAuthors] = useState(true);
  const [openTags, setOpenTags] = useState(true);

  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-r border-border bg-card text-sm shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="flex items-center gap-2 text-lg font-black text-foreground">
          <FilterIcon />
          필터
        </span>
        <button
          type="button"
          className="text-xs font-bold text-primary hover:underline"
          onClick={resetFilters}
        >
          초기화
        </button>
      </div>

      <SidebarSection
        isOpen={openConnection}
        onToggle={() => setOpenConnection((value) => !value)}
        title="연결 기준"
      >
        <ToggleRow label="태그 연결" on={showTagEdges} onChange={setShowTagEdges} />
        <ToggleRow
          label="명시적 링크"
          on={showExplicitEdges}
          onChange={setShowExplicitEdges}
        />
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-bold text-muted-foreground">최소 공통 태그</span>
            <span className="font-black text-foreground">{minSharedTags}개↑</span>
          </div>
          <input
            className="h-1.5 w-full accent-primary"
            max="3"
            min="1"
            onChange={(event) => setMinSharedTags(Number(event.target.value))}
            type="range"
            value={minSharedTags}
          />
        </div>
      </SidebarSection>

      <SidebarSection
        isOpen={openAuthors}
        onToggle={() => setOpenAuthors((value) => !value)}
        title="작성자"
      >
        {authors.map((author) => {
          const active = activeAuthors.has(author.name);

          return (
            <label
              key={author.id}
              className="flex cursor-pointer items-center justify-between gap-3"
            >
              <span className="flex items-center gap-2">
                <Avatar author={author} size="md" />
                <span className="font-bold text-foreground">
                  {author.name}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">
                  {author.count}
                </span>
                <input
                  checked={active}
                  className="h-4 w-4 rounded accent-primary"
                  onChange={() => toggleAuthor(author.name)}
                  type="checkbox"
                />
              </span>
            </label>
          );
        })}
      </SidebarSection>

      <SidebarSection
        isOpen={openTags}
        onToggle={() => setOpenTags((value) => !value)}
        title="태그"
      >
        {tagCounts.map(([tag, count]) => {
          const active = activeTags.has(tag);

          return (
            <label
              key={tag}
              className="flex cursor-pointer items-center justify-between gap-3"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: tagMeta(tag).color }}
                />
                <span className="font-bold text-foreground">{tag}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">
                  {count}
                </span>
                <input
                  checked={active}
                  className="h-4 w-4 rounded accent-primary"
                  onChange={() => toggleTag(tag)}
                  type="checkbox"
                />
              </span>
            </label>
          );
        })}
      </SidebarSection>

      <div className="mt-auto px-4 py-4">
        <p className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">
          통계
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "포스트", value: stats.posts },
            { label: "엣지", value: stats.edges },
            { label: "활성 태그", value: stats.activeTags },
            { label: "작성자", value: stats.authors },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg bg-muted/45 px-3 py-2">
              <p className="text-xl font-black text-foreground">{stat.value}</p>
              <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function SidebarSection({ children, isOpen, onToggle, title }) {
  return (
    <div className="border-b border-border">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-xs font-black uppercase tracking-wide text-muted-foreground"
        onClick={onToggle}
      >
        {title}
        {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
      </button>
      {isOpen ? <div className="space-y-3 px-4 pb-4">{children}</div> : null}
    </div>
  );
}

function ToggleRow({ label, on, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 font-bold text-foreground">
        <MiniConnectionIcon dashed={label === "명시적 링크"} />
        {label}
      </span>
      <button
        type="button"
        aria-label={label}
        aria-pressed={on}
        className="flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors"
        style={{ background: on ? PRIMARY : "#D1D5DB" }}
        onClick={() => onChange(!on)}
      >
        <span
          className="h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}

'use client';

import { memo, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, CircleDot, Eye, Link2, Search, Sparkles, Type } from 'lucide-react';

import { FilterIcon, MiniConnectionIcon } from '@/components/domain/graph-view/ui/GraphViewIcons';
import { PRIMARY } from '@/lib/graph-view/graph-view-utils';
import { cn } from '@/lib/utils';

const MAX_SEARCH_RESULTS = 8;

/** 노드 빠른 검색, 표시 옵션, 연결 기준, 핵심 허브 글과 통계를 통합 제공하는 탐색·필터 사이드바다. */
export const FilterSidebar = memo(function FilterSidebar({
  alwaysShowLabels,
  connectionCountById,
  hasExplicitEdges,
  minSharedTags,
  onSelectPost,
  posts = [],
  resetFilters,
  selectedId = null,
  setAlwaysShowLabels,
  setMinSharedTags,
  setShowExplicitEdges,
  setShowIsolatedNodes,
  setShowTagEdges,
  showExplicitEdges,
  showIsolatedNodes,
  showTagEdges,
  stats,
  topHubPosts = [],
}) {
  const [query, setQuery] = useState('');
  const [openDisplay, setOpenDisplay] = useState(true);
  const [openConnection, setOpenConnection] = useState(true);
  const [openHubs, setOpenHubs] = useState(true);

  const normalizedQuery = query.trim().toLowerCase();
  const matchedPosts = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return posts.filter((post) => post.title.toLowerCase().includes(normalizedQuery)).slice(0, MAX_SEARCH_RESULTS);
  }, [normalizedQuery, posts]);

  function handleReset() {
    setQuery('');
    resetFilters();
  }

  return (
    <aside className="absolute inset-y-0 left-0 z-30 flex w-72 shrink-0 flex-col overflow-y-auto border-r border-border bg-card/95 text-sm shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="flex items-center gap-2 text-lg font-black text-foreground">
          <FilterIcon />
          탐색 · 필터
        </span>
        <button type="button" className="text-xs font-bold text-primary hover:underline" onClick={handleReset}>
          초기화
        </button>
      </div>

      {/* 1. 노드 빠른 검색 — 검색어 입력 시에만 일치 항목을 띄워 해당 노드로 즉시 포커스한다. */}
      <div className="border-b border-border px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            aria-label="글 제목 검색"
            className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-2.5 text-xs font-semibold text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="글 제목으로 노드 찾기..."
            type="search"
            value={query}
          />
        </div>

        {normalizedQuery ? (
          <div className="mt-2.5 space-y-1">
            {matchedPosts.length === 0 ? (
              <p className="px-1 py-1 text-xs text-muted-foreground">일치하는 글이 없습니다.</p>
            ) : (
              matchedPosts.map((post) => {
                const count = connectionCountById?.get(post.id) ?? 0;
                const isSelected = selectedId === post.id;

                return (
                  <button
                    key={post.id}
                    type="button"
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted/60',
                      isSelected ? 'bg-primary/12 text-primary' : 'text-foreground',
                    )}
                    onClick={() => onSelectPost?.(post.id)}
                  >
                    <span className="min-w-0 truncate text-xs font-bold">{post.title}</span>
                    <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      연결 {count}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        ) : null}
      </div>

      {/* 2. 표시 옵션 — 고립 노드 숨김 및 제목 라벨 상시 노출 제어 */}
      <SidebarSection isOpen={openDisplay} onToggle={() => setOpenDisplay((value) => !value)} title="표시 옵션">
        <ToggleRow
          icon={<CircleDot className="size-3.5 text-muted-foreground" />}
          label="고립 노드 표시"
          on={showIsolatedNodes}
          onChange={setShowIsolatedNodes}
        />
        <ToggleRow
          icon={<Type className="size-3.5 text-muted-foreground" />}
          label="제목 라벨 항상 표시"
          on={alwaysShowLabels}
          onChange={setAlwaysShowLabels}
        />
      </SidebarSection>

      {/* 3. 연결 기준 — 키워드·명시적 링크 및 최소 공통 키워드 조절 */}
      <SidebarSection isOpen={openConnection} onToggle={() => setOpenConnection((value) => !value)} title="연결 기준">
        <ToggleRow
          icon={<MiniConnectionIcon dashed={false} />}
          label="키워드 연결"
          on={showTagEdges}
          onChange={setShowTagEdges}
        />
        {hasExplicitEdges ? (
          <ToggleRow
            icon={<MiniConnectionIcon dashed />}
            label="명시적 링크"
            on={showExplicitEdges}
            onChange={setShowExplicitEdges}
          />
        ) : null}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-bold text-muted-foreground">최소 공통 키워드</span>
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

      {/* 4. 핵심 허브 글 TOP 5 — 연결이 가장 많은 대표 글을 클릭해 바로 포커스한다. */}
      <SidebarSection isOpen={openHubs} onToggle={() => setOpenHubs((value) => !value)} title="핵심 허브 글">
        {topHubPosts.length === 0 ? (
          <p className="text-xs text-muted-foreground">연결된 허브 글이 아직 없습니다.</p>
        ) : (
          <div className="space-y-1.5">
            {topHubPosts.map((hub, index) => {
              const isSelected = selectedId === hub.post.id;

              return (
                <button
                  key={hub.post.id}
                  type="button"
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors',
                    isSelected
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border/70 bg-muted/25 text-foreground hover:bg-muted/60',
                  )}
                  onClick={() => onSelectPost?.(hub.post.id)}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-black text-primary">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs font-bold">{hub.post.title}</span>
                  <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-muted-foreground">
                    <Link2 className="size-3" />
                    {hub.degree}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </SidebarSection>

      {/* 5. 통계 */}
      <div className="mt-auto px-4 py-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-muted-foreground">
          <Sparkles className="size-3" />
          통계
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: '포스트', value: stats.posts },
            { label: '엣지', value: stats.edges },
            { label: '연결 노드', value: stats.connectedNodes },
            { label: '고립 노드', value: stats.isolatedNodes },
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
});

/** 접고 펼칠 수 있는 필터 영역을 렌더링한다. */
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

/** 표시·연결 옵션을 전환하는 스위치 행이다. */
function ToggleRow({ icon, label, on, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-xs font-bold text-foreground">
        {icon ?? <Eye className="size-3.5 text-muted-foreground" />}
        {label}
      </span>
      <button
        type="button"
        aria-label={label}
        aria-pressed={on}
        className="flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors"
        style={{ background: on ? PRIMARY : '#D1D5DB' }}
        onClick={() => onChange(!on)}
      >
        <span
          className="h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: on ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

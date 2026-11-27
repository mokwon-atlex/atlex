'use client';

import { memo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { FilterIcon, MiniConnectionIcon } from '@/components/domain/graph-view/ui/GraphViewIcons';
import { PRIMARY } from '@/lib/graph-view/graph-view-utils';

/** 연결 기준 필터와 현재 그래프 통계를 제공하는 사이드바다. */
export const FilterSidebar = memo(function FilterSidebar({
  hasExplicitEdges,
  minSharedTags,
  resetFilters,
  setMinSharedTags,
  setShowExplicitEdges,
  setShowTagEdges,
  showExplicitEdges,
  showTagEdges,
  stats,
}) {
  const [openConnection, setOpenConnection] = useState(true);

  return (
    <aside className="absolute inset-y-0 left-0 z-30 flex w-72 shrink-0 flex-col overflow-y-auto border-r border-border bg-card/95 text-sm shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="flex items-center gap-2 text-lg font-black text-foreground">
          <FilterIcon />
          필터
        </span>
        <button type="button" className="text-xs font-bold text-primary hover:underline" onClick={resetFilters}>
          초기화
        </button>
      </div>

      <SidebarSection isOpen={openConnection} onToggle={() => setOpenConnection((value) => !value)} title="연결 기준">
        <ToggleRow label="키워드 연결" on={showTagEdges} onChange={setShowTagEdges} />
        {hasExplicitEdges ? (
          <ToggleRow label="명시적 링크" on={showExplicitEdges} onChange={setShowExplicitEdges} />
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

      <div className="mt-auto px-4 py-4">
        <p className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">통계</p>
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

/** 관계 표시 여부를 전환하는 스위치 행이다. */
function ToggleRow({ label, on, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 font-bold text-foreground">
        <MiniConnectionIcon dashed={label === '명시적 링크'} />
        {label}
      </span>
      <button
        type="button"
        aria-label={label}
        aria-pressed={on}
        className="flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors"
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

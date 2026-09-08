import { BookOpen, LayoutGrid, PanelLeft } from 'lucide-react';

import { cn } from '@/lib/utils';

export function GraphToolbar({ activeTab, setActiveTab, setShowPanel, setShowSidebar, showPanel, showSidebar }) {
  return (
    <nav className="z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-5 shadow-sm">
      <div className="mr-1 flex min-w-0 items-center gap-2">
        <BookOpen className="size-5 text-primary" strokeWidth={2.4} />
        <span className="text-lg font-black tracking-tight text-foreground">그래프 뷰</span>
      </div>

      <button
        type="button"
        aria-expanded={showSidebar}
        aria-label="필터 패널"
        aria-pressed={showSidebar}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
          showSidebar ? 'bg-primary/12 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
        onClick={() => setShowSidebar((value) => !value)}
      >
        <PanelLeft className="size-5" />
      </button>

      <div className="ml-1 flex gap-1">
        {['탐색', '내 포스트'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={cn(
              'h-9 rounded-full px-4 text-base font-bold transition-colors',
              activeTab === tab
                ? 'bg-primary/12 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <button
        type="button"
        aria-expanded={showPanel}
        aria-label="포스트 목록"
        aria-pressed={showPanel}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
          showPanel ? 'bg-primary/12 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
        onClick={() => setShowPanel((value) => !value)}
      >
        <LayoutGrid className="size-5" />
      </button>
    </nav>
  );
}

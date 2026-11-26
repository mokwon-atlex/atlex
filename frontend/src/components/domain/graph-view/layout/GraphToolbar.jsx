import Link from 'next/link';
import { BookOpen, LayoutGrid, Moon, PanelLeft, Sun } from 'lucide-react';

import { cn } from '@/lib/utils';

/** 그래프 범위 선택, 캔버스 테마 전환과 보조 패널 열기를 제공하는 상단 도구 모음이다. */
export function GraphToolbar({
  activeTab,
  canvasTheme = 'dark',
  isLoggedIn,
  isOwnerScope = false,
  onToggleCanvasTheme,
  scopedUserId = null,
  setActiveTab,
  setShowPanel,
  setShowSidebar,
  showPanel,
  showSidebar,
}) {
  const tabs = [
    { id: 'all', label: '탐색' },
    { id: 'mine', label: '내 포스트' },
    { id: 'category', label: '카테고리별' },
  ];
  const isLightCanvas = canvasTheme === 'light';

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

      <div className="ml-1 flex items-center gap-2">
        {scopedUserId ? (
          <>
            <span className="inline-flex h-9 items-center rounded-full bg-primary/12 px-4 text-sm font-bold text-primary">
              {isOwnerScope ? '내 포스트' : `@${scopedUserId} 포스트`}
            </span>
            <Link
              href="/graph"
              className="inline-flex h-9 items-center rounded-full px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              전체 그래프
            </Link>
          </>
        ) : (
          tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-disabled={tab.id === 'mine' && !isLoggedIn}
              className={cn(
                'h-9 rounded-full px-4 text-base font-bold transition-colors',
                activeTab === tab.id
                  ? 'bg-primary/12 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                tab.id === 'mine' && !isLoggedIn ? 'cursor-not-allowed opacity-50' : '',
              )}
              onClick={() => {
                if (tab.id !== 'mine' || isLoggedIn) {
                  setActiveTab(tab.id);
                }
              }}
            >
              {tab.label}
            </button>
          ))
        )}
      </div>

      <div className="flex-1" />

      {onToggleCanvasTheme ? (
        <button
          type="button"
          aria-label={isLightCanvas ? '다크 캔버스로 전환' : '라이트 캔버스로 전환'}
          aria-pressed={isLightCanvas}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/80 bg-muted/45 px-3 text-xs font-bold text-foreground transition-colors hover:border-foreground/20 hover:bg-muted"
          data-canvas-theme-toggle
          onClick={onToggleCanvasTheme}
          title={isLightCanvas ? '밤하늘 다크 캔버스로 전환' : '밝은 라이트 캔버스로 전환'}
        >
          {isLightCanvas ? <Moon className="size-4 text-primary" /> : <Sun className="size-4 text-amber-400" />}
          <span className="hidden sm:inline">{isLightCanvas ? '라이트' : '다크'}</span>
        </button>
      ) : null}

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

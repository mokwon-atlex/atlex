'use client';

// [Section] 에디터 상단 전체 노출 서식 툴바 + AI 작성 도구 바.
// 모든 서식·삽입·편집 도구와 AI 블록 삽입·AI 이어쓰기 버튼을 상단 고정 영역에 통합 배치한다.
import { Fragment, useState } from 'react';
import { ChevronDown, Code2, GitFork, Loader2, Sigma, Sparkles, Table2 } from 'lucide-react';

import { Button } from '@/components/common/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/common/ui/popover';
import { Separator } from '@/components/common/ui/separator';
import PostEditorToolbarButton from '../ui/PostEditorToolbarButton';

/**
 * 글쓰기 에디터의 전체 서식·삽입·편집 도구와 AI 작성 도구를 상단에 고정 노출하는 툴바다.
 *
 * @param {object} props
 * @param {(groupId: string, itemLabel: string) => { isActive: boolean, isDisabled: boolean }} props.getItemState 버튼 상태 조회 함수
 * @param {boolean} [props.isSuggestingParagraph] AI 단락 작성 중 여부
 * @param {(groupId: string, itemLabel: string) => void} props.onExecuteItem 버튼 실행 핸들러
 * @param {(mode?: string) => void} [props.onRequestParagraphAi] AI 자동 글쓰기·블록 삽입 요청 핸들러
 * @param {Array<{ id: string, groups: Array<{ id: string, title: string, items: string[] }> }>} props.toolCategories 도구 카테고리 목록
 */
export default function PostEditorToolRail({
  getItemState,
  isSuggestingParagraph = false,
  onExecuteItem,
  onRequestParagraphAi,
  toolCategories,
}) {
  const [aiMenuOpen, setAiMenuOpen] = useState(false);

  const visibleGroups = toolCategories.flatMap((category) =>
    category.groups.filter((group) => Array.isArray(group.items) && group.items.length > 0),
  );

  return (
    <div className="flex w-full flex-col divide-y divide-border/80 dark:divide-zinc-700/90">
      {onRequestParagraphAi ? (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/25 px-4 py-2 sm:px-6 dark:bg-zinc-900/70">
          <div className="flex flex-wrap items-center gap-2">
            <Popover open={aiMenuOpen} onOpenChange={setAiMenuOpen}>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={isSuggestingParagraph}
                    className="gap-1.5 border-border bg-background text-xs font-medium text-foreground hover:bg-muted dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                }
              >
                <Sparkles className="size-3 text-primary" />
                <span>AI 블록 삽입</span>
                <ChevronDown className="size-3 opacity-70" />
              </PopoverTrigger>
              <PopoverContent align="start" className="w-52 space-y-1 p-1.5 dark:border-zinc-700">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setAiMenuOpen(false);
                    onRequestParagraphAi('CODE');
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-foreground hover:bg-muted"
                >
                  <Code2 className="size-3.5 text-primary" />
                  <span>예제 코드 블록</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setAiMenuOpen(false);
                    onRequestParagraphAi('DIAGRAM');
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-foreground hover:bg-muted"
                >
                  <GitFork className="size-3.5 text-primary" />
                  <span>Mermaid 다이어그램</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setAiMenuOpen(false);
                    onRequestParagraphAi('TABLE');
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-foreground hover:bg-muted"
                >
                  <Table2 className="size-3.5 text-primary" />
                  <span>마크다운 비교 표</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setAiMenuOpen(false);
                    onRequestParagraphAi('MATH');
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-foreground hover:bg-muted"
                >
                  <Sigma className="size-3.5 text-primary" />
                  <span>LaTeX 수식 블록</span>
                </button>
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              variant="outline"
              size="xs"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onRequestParagraphAi('AUTO')}
              disabled={isSuggestingParagraph}
              className="gap-1.5 border-border bg-background text-xs font-medium text-foreground hover:bg-muted dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              title="현재 커서 위치에 AI가 다음 문장을 이어서 추천합니다 (Win: Ctrl+J / Mac: ⌘+J, 적용: Tab, 취소: Esc)"
            >
              {isSuggestingParagraph ? (
                <Loader2 className="size-3 animate-spin text-primary" />
              ) : (
                <Sparkles className="size-3 text-primary" />
              )}
              <span>{isSuggestingParagraph ? '작성 중...' : 'AI 이어쓰기'}</span>
              <span className="rounded border border-border bg-muted/60 px-1 font-mono text-[10px] text-foreground/80 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">
                Ctrl+J / ⌘J
              </span>
            </Button>
          </div>

          <span className="hidden items-center gap-1 text-[11px] font-medium text-muted-foreground sm:inline-flex dark:text-zinc-300">
            <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono text-[10px] text-foreground dark:border-zinc-600 dark:bg-zinc-800">
              /
            </kbd>
            <span>단축 명령어</span>
          </span>
        </div>
      ) : null}

      <div className="flex w-full flex-wrap items-center gap-x-1 gap-y-1.5 px-4 py-2 sm:px-6">
        {visibleGroups.map((group, groupIndex) => (
          <Fragment key={group.id}>
            {groupIndex > 0 ? <Separator orientation="vertical" className="mx-1 h-5 dark:bg-zinc-700" /> : null}
            <div className="flex flex-wrap items-center gap-0.5" role="group" aria-label={group.title}>
              {group.items.map((item) => {
                const { isActive, isDisabled } = getItemState(group.id, item);

                return (
                  <PostEditorToolbarButton
                    key={`${group.id}-${item}`}
                    groupId={group.id}
                    isActive={isActive}
                    isDisabled={isDisabled}
                    item={item}
                    onExecuteItem={onExecuteItem}
                  />
                );
              })}
            </div>
          </Fragment>
        ))}

        {!onRequestParagraphAi ? (
          <span className="ml-auto hidden items-center gap-1 pl-2 text-[11px] font-medium text-muted-foreground lg:inline-flex dark:text-zinc-300">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px] text-foreground dark:border-zinc-600 dark:bg-zinc-800">
              /
            </kbd>
            <span>단축 명령어</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}

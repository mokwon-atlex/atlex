'use client';

// [Section] 에디터 상단 슬림 1줄 서식 툴바.
// 자주 쓰는 핵심 서식만 1줄에 바로 노출하고, 나머지 보조 도구는 '더보기' 팝오버에 모아 깔끔하게 유지한다.
import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/common/ui/popover';
import { Separator } from '@/components/common/ui/separator';
import PostEditorToolbarButton from '../ui/PostEditorToolbarButton';

const PRIMARY_ITEMS = [
  { groupId: 'heading-level', item: '제목 1' },
  { groupId: 'heading-level', item: '제목 2' },
  { groupId: 'heading-level', item: '제목 3' },
  null,
  { groupId: 'font-style', item: '볼드' },
  { groupId: 'font-style', item: '이탤릭' },
  { groupId: 'font-style', item: '취소선' },
  { groupId: 'paragraph-type', item: '인용문' },
  null,
  { groupId: 'insert-basic', item: '링크' },
  { groupId: 'insert-basic', item: '이미지' },
  { groupId: 'insert-advanced', item: '코드 블록' },
];

const PRIMARY_SET = new Set(PRIMARY_ITEMS.filter(Boolean).map(({ groupId, item }) => `${groupId}:${item}`));

export default function PostEditorToolRail({
  getItemState, // (groupId, itemLabel) => { isActive, isDisabled }
  onExecuteItem, // (groupId, itemLabel) => void
  toolCategories, // { id, title, railLabel, groups[] }[]
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  const secondaryGroups = toolCategories.flatMap((tool) =>
    tool.groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => !PRIMARY_SET.has(`${group.id}:${item}`)),
      }))
      .filter((group) => group.items.length > 0),
  );

  return (
    <div className="flex w-full items-center justify-between gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
      <div className="flex items-center gap-1">
        {PRIMARY_ITEMS.map((entry, idx) => {
          if (!entry) {
            return <Separator key={`sep-${idx}`} orientation="vertical" className="mx-1.5 h-5" />;
          }
          const { isActive, isDisabled } = getItemState(entry.groupId, entry.item);
          return (
            <PostEditorToolbarButton
              key={`${entry.groupId}-${entry.item}`}
              groupId={entry.groupId}
              isActive={isActive}
              isDisabled={isDisabled}
              item={entry.item}
              onExecuteItem={onExecuteItem}
            />
          );
        })}
      </div>

      {secondaryGroups.length > 0 && (
        <Popover open={moreOpen} onOpenChange={setMoreOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                className="shrink-0 gap-1 text-xs text-muted-foreground hover:text-foreground"
                aria-label="서식 도구 더보기"
              />
            }
          >
            <MoreHorizontal className="size-4" />
            <span className="hidden sm:inline">더보기</span>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 space-y-3 p-3">
            {secondaryGroups.map((group) => (
              <div key={group.id} className="space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground">{group.title}</p>
                <div className="flex flex-wrap items-center gap-1">
                  {group.items.map((item) => {
                    const { isActive, isDisabled } = getItemState(group.id, item);
                    return (
                      <PostEditorToolbarButton
                        key={`${group.id}-${item}`}
                        groupId={group.id}
                        isActive={isActive}
                        isDisabled={isDisabled}
                        item={item}
                        onExecuteItem={(gid, it) => {
                          onExecuteItem(gid, it);
                          setMoreOpen(false);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

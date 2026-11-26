'use client';

// [Section] 에디터 상단 전체 노출 서식 툴바.
// 더보기 메뉴에 숨기지 않고 모든 서식·삽입·편집 도구를 그룹 구분선과 함께 바로 클릭할 수 있게 배치한다.
import { Fragment } from 'react';

import { Separator } from '@/components/common/ui/separator';
import PostEditorToolbarButton from '../ui/PostEditorToolbarButton';

/**
 * 글쓰기 에디터의 전체 서식·삽입·편집 도구를 그룹별로 구분해 직접 노출하는 상단 툴바다.
 *
 * @param {object} props
 * @param {(groupId: string, itemLabel: string) => { isActive: boolean, isDisabled: boolean }} props.getItemState 버튼 상태 조회 함수
 * @param {(groupId: string, itemLabel: string) => void} props.onExecuteItem 버튼 실행 핸들러
 * @param {Array<{ id: string, groups: Array<{ id: string, title: string, items: string[] }> }>} props.toolCategories 도구 카테고리 목록
 */
export default function PostEditorToolRail({ getItemState, onExecuteItem, toolCategories }) {
  const visibleGroups = toolCategories.flatMap((category) =>
    category.groups.filter((group) => Array.isArray(group.items) && group.items.length > 0),
  );

  return (
    <div className="flex w-full flex-wrap items-center gap-x-1 gap-y-1.5 px-4 py-2.5 sm:px-6">
      {visibleGroups.map((group, groupIndex) => (
        <Fragment key={group.id}>
          {groupIndex > 0 ? <Separator orientation="vertical" className="mx-1 h-5" /> : null}
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
      <span className="ml-auto hidden pl-2 text-[11px] font-medium text-muted-foreground lg:inline">
        본문에서 <kbd className="rounded border border-border/80 bg-muted px-1 py-0.5 font-mono text-[10px]">/</kbd>로 단축 삽입
      </span>
    </div>
  );
}

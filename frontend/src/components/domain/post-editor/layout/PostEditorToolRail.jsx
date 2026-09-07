// [Section] 에디터 상단 툴바 — 각 편집 기능을 한 번에 확인하고 바로 실행할 수 있도록 표시한다.
import { Separator } from '@/components/common/ui/separator';
import PostEditorToolbarButton from '../ui/PostEditorToolbarButton';

export default function PostEditorToolRail({
  getItemState, // (groupId, itemLabel) => { isActive, isDisabled }
  onExecuteItem, // (groupId, itemLabel) => void
  toolCategories, // { id, title, railLabel, groups[] }[]
}) {
  return (
    <div className="flex w-full flex-wrap items-center gap-2 px-4 py-3">
      {toolCategories.map((tool, toolIndex) => (
        <div key={tool.id} className="flex flex-wrap items-center gap-2">
          {/* 카테고리 구분선을 표시하여 기능 그룹을 쉽게 구분할 수 있도록 한다. */}
          {toolIndex > 0 && <Separator orientation="vertical" className="mx-1 hidden h-7 sm:block" />}

          {tool.groups.map((group) => (
            <div key={group.id} className="flex flex-wrap items-center gap-1">
              {/* 그룹 제목은 화면에서는 숨기고 보조 기술에서만 읽을 수 있도록 유지한다. */}
              <span className="sr-only">{group.title}</span>

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
          ))}
        </div>
      ))}
    </div>
  );
}

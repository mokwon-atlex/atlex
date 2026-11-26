import { Type } from 'lucide-react';

import { Button } from '@/components/common/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/common/ui/tooltip';
import { TOOLBAR_SLASH_HINT_MAP, getToolbarShortcutLabel } from '@/lib/post-editor/rich-text-slash-commands';
import { TOOLBAR_ITEM_ICON_MAP } from '@/lib/post-editor/rich-text-toolbar-icons';

/** 에디터 상단 서식 툴바의 개별 아이콘 버튼이다. 툴팁에 슬래시 단축어 또는 현재 OS에 맞는 단축키를 표시한다. */
export default function PostEditorToolbarButton({
  groupId,
  isActive,
  isAppleOs = false,
  isDisabled,
  item,
  onExecuteItem,
}) {
  const Icon = TOOLBAR_ITEM_ICON_MAP[item] ?? Type;
  const slashHint = TOOLBAR_SLASH_HINT_MAP[item];
  const shortcutLabel = getToolbarShortcutLabel(item, isAppleOs);
  const hintText = slashHint || shortcutLabel;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant={isActive ? 'default' : 'ghost'}
            size="icon-sm"
            disabled={isDisabled}
            aria-label={item}
            aria-pressed={isActive}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onExecuteItem(groupId, item)}
            className={isActive ? undefined : 'text-foreground/85 hover:text-foreground dark:text-zinc-200'}
          />
        }
      >
        {/* 항목 라벨에 매칭되는 아이콘을 표시한다. */}
        <Icon className="h-4 w-4" />
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-1.5">
        <span className="font-semibold">{item}</span>
        {hintText ? (
          <kbd className="rounded bg-background/20 px-1.5 py-0.5 font-mono text-[10px]">{hintText}</kbd>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}

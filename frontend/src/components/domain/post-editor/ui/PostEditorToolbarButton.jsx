import { Type } from 'lucide-react';

import { Button } from '@/components/common/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/common/ui/tooltip';
import { TOOLBAR_SHORTCUT_HINT_MAP, TOOLBAR_SLASH_HINT_MAP } from '@/lib/post-editor/rich-text-slash-commands';
import { TOOLBAR_ITEM_ICON_MAP } from '@/lib/post-editor/rich-text-toolbar-icons';

/** 에디터 상단 서식 툴바의 개별 아이콘 버튼이다. 툴팁에 슬래시 단축어 또는 OS별 키보드 단축키를 표시한다. */
export default function PostEditorToolbarButton({ groupId, isActive, isDisabled, item, onExecuteItem }) {
  const Icon = TOOLBAR_ITEM_ICON_MAP[item] ?? Type;
  const slashHint = TOOLBAR_SLASH_HINT_MAP[item];
  const shortcutHint = TOOLBAR_SHORTCUT_HINT_MAP[item];

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
      <TooltipContent side="bottom" className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">{item}</span>
          {slashHint ? (
            <kbd className="rounded bg-background/20 px-1 py-0.5 font-mono text-[10px]">{slashHint}</kbd>
          ) : null}
        </div>
        {!slashHint && shortcutHint ? (
          <div className="flex items-center gap-1.5 font-mono text-[10px] opacity-90">
            <span>Win: {shortcutHint.win}</span>
            <span>·</span>
            <span>Mac: {shortcutHint.mac}</span>
          </div>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}

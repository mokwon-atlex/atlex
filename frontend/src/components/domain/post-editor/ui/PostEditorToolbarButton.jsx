import { Button } from '@/components/common/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/common/ui/tooltip';
import { TOOLBAR_ITEM_ICON_MAP } from '@/lib/post-editor/rich-text-toolbar-icons';
import { Type } from 'lucide-react';

export default function PostEditorToolbarButton({ groupId, isActive, isDisabled, item, onExecuteItem }) {
  const Icon = TOOLBAR_ITEM_ICON_MAP[item] ?? Type;

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
            onClick={() => onExecuteItem(groupId, item)}
          />
        }
      >
        {/* 항목 라벨에 매칭되는 아이콘을 표시한다. */}
        <Icon className="h-4 w-4" />
      </TooltipTrigger>
      <TooltipContent side="bottom">{item}</TooltipContent>
    </Tooltip>
  );
}

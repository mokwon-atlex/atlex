// [Section] 툴 카테고리 버튼 + 컴팩트 아이콘 팝오버 — 카테고리 클릭 시 그룹·항목을 아이콘 그리드로 표시
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight,
  AlertCircle, Bold, Captions, CheckSquare, ChevronRight,
  Code2, Columns2, Eraser, FileText, Heading, Heading1, Heading2, Heading3,
  Highlighter, Image, Italic, Link, Minus, Paperclip, PaintBucket,
  Palette, PenLine, Quote, RemoveFormatting, Redo2, Sigma, Strikethrough,
  Table, Type, Underline, Undo2,
} from "lucide-react";

const RAIL_ICON_MAP = {
  Type,
  Heading,
  PenLine,
};

import { Button } from "@/components/common/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/common/ui/popover";
import { Separator } from "@/components/common/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/common/ui/tooltip";

const ITEM_ICON_MAP = {
  "볼드": Bold,
  "이탤릭": Italic,
  "밑줄": Underline,
  "취소선": Strikethrough,
  "글자색": Palette,
  "배경색": PaintBucket,
  "강조 배경": Highlighter,
  "투명 배경": Eraser,
  "왼쪽 정렬": AlignLeft,
  "가운데 정렬": AlignCenter,
  "오른쪽 정렬": AlignRight,
  "양쪽 정렬": AlignJustify,
  "제목 1": Heading1,
  "제목 2": Heading2,
  "제목 3": Heading3,
  "본문": Type,
  "리드 문단": FileText,
  "인용문": Quote,
  "캡션": Captions,
  "구분선": Minus,
  "토글 섹션": ChevronRight,
  "체크리스트": CheckSquare,
  "링크": Link,
  "이미지": Image,
  "파일": Paperclip,
  "표": Table,
  "코드 블록": Code2,
  "수식(LaTeX)": Sigma,
  "알림 박스": AlertCircle,
  "구분 영역": Columns2,
  "실행 취소": Undo2,
  "다시 실행": Redo2,
  "서식 제거": RemoveFormatting,
};

export default function PostEditorToolPopover({ getItemState, onExecuteItem, tool }) {
  const RailIcon = RAIL_ICON_MAP[tool.railIcon];

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={`${tool.title} 도구 열기`}
          >
            {RailIcon ? <RailIcon className="h-4 w-4" /> : tool.railLabel}
          </Button>
        }
      />

      <PopoverContent side="top" sideOffset={8} className="w-auto gap-0 p-3">
        {tool.groups.map((group, index) => (
          <div key={group.id}>
            {index > 0 && <Separator className="my-2" />}
            <p className="mb-1.5 px-0.5 text-xs font-semibold text-muted-foreground">
              {group.title}
            </p>
            <div className="flex flex-wrap gap-1">
              {group.items.map((item) => {
                const Icon = ITEM_ICON_MAP[item] ?? Type;
                const { isActive, isDisabled } = getItemState(group.id, item);

                return (
                  <Tooltip key={item}>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          variant={isActive ? "default" : "ghost"}
                          size="icon-sm"
                          disabled={isDisabled}
                          aria-pressed={isActive}
                          onClick={() => onExecuteItem(group.id, item)}
                        />
                      }
                    >
                      <Icon className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent side="top">{item}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}

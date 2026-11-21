'use client';

// [UI] TipTap 에디터 내부에서 detailsBlock(토글 섹션)의 제목과 접기/펼치기 상태를 인라인으로 편집한다.
import { useState } from 'react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

import { Button } from '@/components/common/ui/button';

export default function DetailsBlockNodeView({ node, updateAttributes, deleteNode, selected }) {
  const [isOpen, setIsOpen] = useState(true);
  const title = node.attrs?.title ?? '토글 제목';

  return (
    <NodeViewWrapper
      as="div"
      data-type="details-block"
      className={`group my-4 rounded-lg border bg-background px-4 py-3 transition-colors ${
        selected ? 'border-foreground ring-2 ring-foreground/20' : 'border-border/80'
      }`}
    >
      <div contentEditable={false} className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? '토글 접기' : '토글 펼치기'}
          aria-expanded={isOpen}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>

        <input
          type="text"
          value={title}
          onChange={(e) => updateAttributes?.({ title: e.target.value })}
          placeholder="토글 제목을 입력하세요"
          aria-label="토글 섹션 제목"
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
        />

        <Button
          type="button"
          variant="ghost"
          size="xs"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => deleteNode?.()}
          aria-label="토글 섹션 삭제"
          className="h-6 gap-1 px-2 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Trash2 className="size-3" />
          삭제
        </Button>
      </div>

      {isOpen ? (
        <div className="mt-2 border-t border-border/60 pt-2 pl-8">
          <NodeViewContent className="post-editor-block__body min-h-6 outline-none" />
        </div>
      ) : null}
    </NodeViewWrapper>
  );
}

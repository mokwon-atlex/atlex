'use client';

// [UI] TipTap 에디터 내부에서 mathBlock 노드를 KaTeX로 렌더링하고 클릭 시 수정 모달을 연다.
import { useMemo } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/common/ui/button';
import { renderLatexToHtml } from '@/lib/post-editor/math-render';

export default function MathBlockNodeView({ editor, getPos, node, deleteNode, selected }) {
  const latex = node.textContent ?? '';
  const renderedHtml = useMemo(() => renderLatexToHtml(latex), [latex]);

  function handleEdit() {
    const pos = typeof getPos === 'function' ? getPos() : null;
    editor.storage.mathBlock?.openModal?.({
      editPos: pos,
      initialLatex: latex,
    });
  }

  return (
    <NodeViewWrapper
      as="div"
      data-type="math-block"
      contentEditable={false}
      className={`group relative my-4 rounded-lg border bg-background px-4 py-3 transition-colors ${
        selected ? 'border-foreground ring-2 ring-foreground/20' : 'border-border/80 hover:border-foreground/40'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          수식 (LaTeX)
        </span>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-6 gap-1 px-2 text-xs"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleEdit}
          >
            <Pencil className="size-3" />
            수정
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-6 gap-1 px-2 text-xs text-destructive hover:text-destructive"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => deleteNode?.()}
          >
            <Trash2 className="size-3" />
            삭제
          </Button>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={handleEdit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleEdit();
          }
        }}
        className="flex min-h-10 cursor-pointer items-center justify-center overflow-x-auto py-1"
        title="클릭하여 수식 수정"
      >
        {renderedHtml ? (
          <div className="text-foreground" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
        ) : (
          <code className="font-mono text-sm text-muted-foreground">{latex || '수식을 입력하세요'}</code>
        )}
      </div>
    </NodeViewWrapper>
  );
}

'use client';

// [Section] 수식(LaTeX) 작성 모달 — 상단 수식 구조·기호 버튼, LaTeX 입력, 실시간 KaTeX 미리보기 제공
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check } from 'lucide-react';

import { Button } from '@/components/common/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog';
import { Textarea } from '@/components/common/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/common/ui/tooltip';
import { MATH_STRUCTURE_GROUPS, MATH_SYMBOL_GROUPS } from '@/data/post-editor/post-editor-math-symbols';
import { renderLatexToHtml } from '@/lib/post-editor/math-render';

/**
 * 수식 작성 및 수정을 위한 모달.
 *
 * @param {object} props
 * @param {boolean} props.isOpen 모달 열림 여부
 * @param {string} [props.initialLatex] 수정 시 기존 LaTeX 문자열
 * @param {() => void} props.onClose 닫기 핸들러
 * @param {(latex: string) => void} props.onSubmit 수식 입력 완료 핸들러
 */
export default function PostEditorMathModal({ isOpen, initialLatex = '', onClose, onSubmit }) {
  const [latex, setLatex] = useState(initialLatex);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setLatex(initialLatex ?? '');
      // 모달 애니메이션 직후 입력창에 포커스한다.
      const timerId = window.setTimeout(() => {
        textareaRef.current?.focus();
      }, 40);
      return () => window.clearTimeout(timerId);
    }
  }, [isOpen, initialLatex]);

  const previewHtml = useMemo(() => renderLatexToHtml(latex), [latex]);

  function insertSnippet(snippet) {
    const textarea = textareaRef.current;

    if (!textarea) {
      setLatex((prev) => (prev ? `${prev} ${snippet}` : snippet));
      return;
    }

    const start = textarea.selectionStart ?? latex.length;
    const end = textarea.selectionEnd ?? latex.length;
    const nextValue = `${latex.slice(0, start)}${snippet}${latex.slice(end)}`;
    const nextCursor = start + snippet.length;

    setLatex(nextValue);

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function handleSubmit(e) {
    e?.preventDefault();
    const trimmed = latex.trim();
    if (!trimmed) {
      return;
    }
    onSubmit?.(trimmed);
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && onClose?.()}>
      <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">수식 입력</DialogTitle>
          <DialogDescription>
            기호 버튼을 누르거나 LaTeX 수식을 직접 입력하면 아래에서 미리 볼 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 1행: 주요 수식 구조 템플릿 */}
          <div className="rounded-lg border border-border bg-muted/30 p-2">
            <div className="flex flex-wrap gap-1">
              {MATH_STRUCTURE_GROUPS.map((item) => (
                <Tooltip key={item.id}>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 min-w-10 px-2.5 font-serif text-sm"
                        onClick={() => insertSnippet(item.latex)}
                      />
                    }
                  >
                    {item.preview}
                  </TooltipTrigger>
                  <TooltipContent side="top">{item.tooltip}</TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* 2행: 연산자, 관계 기호, 그리스 문자, 화살표/집합 */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border/70 pt-2">
              {MATH_SYMBOL_GROUPS.map((group) => (
                <div key={group.id} className="flex flex-wrap items-center gap-0.5">
                  {group.items.map((symbol) => (
                    <Tooltip key={`${group.id}-${symbol.label}`}>
                      <TooltipTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="h-7 min-w-7 px-1.5 font-serif text-sm"
                            onClick={() => insertSnippet(`${symbol.latex} `)}
                          />
                        }
                      >
                        {symbol.label}
                      </TooltipTrigger>
                      <TooltipContent side="top">{symbol.latex}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 수식 입력 영역 */}
          <Textarea
            ref={textareaRef}
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder="예: \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
            className="min-h-28 resize-y font-mono text-sm leading-6"
            aria-label="LaTeX 수식 입력"
          />

          {/* 실시간 미리보기 영역 */}
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">미리보기</p>
            <div className="flex min-h-16 items-center justify-center overflow-x-auto py-2">
              {previewHtml ? (
                <div className="text-foreground" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <span className="text-sm text-muted-foreground">수식을 입력하면 여기에 미리보기가 표시됩니다.</span>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={!latex.trim()} className="gap-1.5">
              <Check className="size-4" />
              입력
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

// [Section] tiptap 리치 텍스트 에디터 본문 섹션.
// 본문 영역 어디를 클릭해도 즉시 에디터 포커스가 잡혀 글쓰기를 시작할 수 있다.
import { useState } from 'react';
import { EditorContent } from '@tiptap/react';
import { ChevronDown, Code2, GitFork, Loader2, Sigma, Sparkles, Table2, Trash2 } from 'lucide-react';

import { Button } from '@/components/common/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/common/ui/popover';
import { Textfield } from '@/components/common/ui/textfield';
import PostLinkPopover from '@/components/domain/post-editor/ui/PostLinkPopover';
import SlashCommandPopover from '@/components/domain/post-editor/ui/SlashCommandPopover';

export default function PostEditorContentSection({
  bodyPlaceholder,
  editor, // usePostEditorRichText가 반환한 tiptap Editor 인스턴스
  isEditorEmpty,
  isSuggestingParagraph = false,
  onRequestParagraphAi,
  onCancelParagraphAi,
  userId,
}) {
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const isTableActive = Boolean(editor?.isActive('table'));

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
      e.preventDefault();
      if (!isSuggestingParagraph && onRequestParagraphAi) {
        onRequestParagraphAi();
      }
    }
  };

  const handleKeyDownCapture = (e) => {
    if (e.key === 'Escape') {
      onCancelParagraphAi?.();
    }
  };

  // 본문 영역의 여백이나 빈 공간을 클릭해도 즉시 에디터 끝으로 포커스한다.
  const handleCanvasClick = (e) => {
    if (!editor) return;
    const target = e.target;
    if (target instanceof Element) {
      if (target.closest('.tiptap') || target.closest('button, a, input, textarea, select, [role="dialog"]')) {
        return;
      }
    }
    editor.chain().focus('end').run();
  };

  return (
    <div className="flex flex-1 flex-col">
      {(onRequestParagraphAi || isTableActive) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/20 px-5 py-2 sm:px-7">
          {onRequestParagraphAi ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <Popover open={aiMenuOpen} onOpenChange={setAiMenuOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onMouseDown={(e) => e.preventDefault()}
                      disabled={isSuggestingParagraph}
                      className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                    />
                  }
                >
                  <Sparkles className="size-3 text-primary" />
                  <span>AI 블록 삽입</span>
                  <ChevronDown className="size-3 opacity-60" />
                </PopoverTrigger>
                <PopoverContent align="start" className="w-52 space-y-1 p-1.5">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setAiMenuOpen(false);
                      onRequestParagraphAi('CODE');
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs hover:bg-muted"
                  >
                    <Code2 className="size-3.5 text-primary" />
                    <span>예제 코드 블록</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setAiMenuOpen(false);
                      onRequestParagraphAi('DIAGRAM');
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs hover:bg-muted"
                  >
                    <GitFork className="size-3.5 text-primary" />
                    <span>Mermaid 다이어그램</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setAiMenuOpen(false);
                      onRequestParagraphAi('TABLE');
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs hover:bg-muted"
                  >
                    <Table2 className="size-3.5 text-primary" />
                    <span>마크다운 비교 표</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setAiMenuOpen(false);
                      onRequestParagraphAi('MATH');
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs hover:bg-muted"
                  >
                    <Sigma className="size-3.5 text-primary" />
                    <span>LaTeX 수식 블록</span>
                  </button>
                </PopoverContent>
              </Popover>

              <Button
                type="button"
                variant="outline"
                size="xs"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onRequestParagraphAi('AUTO')}
                disabled={isSuggestingParagraph}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                title="현재 커서 위치에 AI가 다음 문장을 이어서 추천합니다 (단축키: Ctrl + J, 적용: Tab, 취소: Esc)"
              >
                {isSuggestingParagraph ? (
                  <Loader2 className="size-3 animate-spin text-primary" />
                ) : (
                  <Sparkles className="size-3 text-primary" />
                )}
                <span>{isSuggestingParagraph ? '작성 중...' : 'AI 이어쓰기'}</span>
                <span className="rounded border border-border/60 bg-muted/40 px-1 text-[10px] text-muted-foreground">
                  Ctrl+J
                </span>
              </Button>
            </div>
          ) : (
            <div />
          )}

          {isTableActive ? (
            <div className="flex flex-wrap items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-xs">
              <span className="mr-1 font-semibold text-foreground">표 편집</span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().addRowAfter().run()}
              >
                행 추가
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().deleteRow().run()}
              >
                행 삭제
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().addColumnAfter().run()}
              >
                열 추가
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().deleteColumn().run()}
              >
                열 삭제
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="xs"
                className="gap-1"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().deleteTable().run()}
              >
                <Trash2 className="size-3" />표 삭제
              </Button>
            </div>
          ) : null}
        </div>
      )}

      <div
        data-editor-canvas
        onClick={handleCanvasClick}
        className="relative flex min-h-[480px] flex-1 cursor-text flex-col px-5 py-6 sm:px-7"
      >
        {isEditorEmpty && bodyPlaceholder ? (
          <Textfield
            variant="muted"
            size="default"
            whitespace="preline"
            className="pointer-events-none absolute inset-x-5 top-6 leading-8 sm:inset-x-7"
          >
            {bodyPlaceholder}
          </Textfield>
        ) : null}

        <div
          onKeyDown={handleKeyDown}
          onKeyDownCapture={handleKeyDownCapture}
          className="post-editor-prose flex-1 break-words"
        >
          <EditorContent editor={editor} className="h-full min-h-[460px]" />
        </div>

        <PostLinkPopover editor={editor} userId={userId} />
        <SlashCommandPopover editor={editor} />
      </div>
    </div>
  );
}

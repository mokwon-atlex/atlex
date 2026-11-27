'use client';

// [Section] tiptap 리치 텍스트 에디터 본문 섹션.
// 게시 후 상세 본문(BlogDetailArticle)과 동일한 읽기 폭·타이포그래피 리듬을 유지한다.
import { EditorContent } from '@tiptap/react';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/common/ui/button';
import { Textfield } from '@/components/common/ui/textfield';
import PostLinkPopover from '@/components/domain/post-editor/ui/PostLinkPopover';
import SlashCommandPopover from '@/components/domain/post-editor/ui/SlashCommandPopover';
import { isPlainEmptyDocument } from '@/lib/post-editor/rich-text-utils';

export default function PostEditorContentSection({
  bodyPlaceholder,
  editor, // usePostEditorRichText가 반환한 tiptap Editor 인스턴스
  isEditorEmpty,
  isSuggestingParagraph = false,
  onRequestParagraphAi,
  onCancelParagraphAi,
  userId,
}) {
  const isTableActive = Boolean(editor?.isActive('table'));
  // 코드 블록·표·제목·인용문 등 빈 블록이 삽입된 경우에도 placeholder가 뒤에 비치지 않도록 문서 구조를 함께 확인한다.
  const isPlaceholderVisible = editor ? isPlainEmptyDocument(editor.state.doc) : isEditorEmpty;

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
      e.preventDefault();
      if (!isSuggestingParagraph && onRequestParagraphAi) {
        onRequestParagraphAi();
      }
    }
  };

  const handleKeyDownCapture = (e) => {
    if (e.key === 'Escape' && isSuggestingParagraph) {
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
      {isTableActive ? (
        <div className="border-b border-border bg-muted/25 py-2 dark:border-zinc-700/90 dark:bg-zinc-900/70">
          <div className="mx-auto flex w-full max-w-[820px] flex-wrap items-center justify-end gap-1 px-5 text-xs sm:px-8">
            <div className="flex flex-wrap items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1">
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
          </div>
        </div>
      ) : null}

      <div
        data-editor-canvas
        onClick={handleCanvasClick}
        className="relative flex min-h-[500px] flex-1 cursor-text flex-col py-7"
      >
        <div className="relative mx-auto flex w-full max-w-[820px] flex-1 flex-col px-5 sm:px-8">
          {isPlaceholderVisible && bodyPlaceholder ? (
            <Textfield
              variant="muted"
              size="default"
              whitespace="preline"
              className="pointer-events-none absolute inset-x-5 top-0 leading-7 text-muted-foreground/80 sm:inset-x-8 dark:text-zinc-400"
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
        </div>

        <PostLinkPopover editor={editor} userId={userId} />
        <SlashCommandPopover editor={editor} />
      </div>
    </div>
  );
}

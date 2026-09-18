'use client';

// [Section] tiptap 리치 텍스트 에디터를 Card(dashed) 안에 렌더하는 본문 섹션.
// 에디터가 비어 있을 때만 placeholder를 absolute로 겹쳐서 표시한다.
import { EditorContent } from '@tiptap/react';
import { Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/common/ui/button';
import { Card, CardContent, CardTitle } from '@/components/common/ui/card';
import { Textfield } from '@/components/common/ui/textfield';

export default function PostEditorContentSection({
  bodyPlaceholder,
  bodyText, // 글자 수 카운터에 사용
  editor, // usePostEditorRichText가 반환한 tiptap Editor 인스턴스
  isEditorEmpty,
  isSuggestingParagraph = false,
  onRequestParagraphAi,
}) {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
      e.preventDefault();
      if (!isSuggestingParagraph && onRequestParagraphAi) {
        onRequestParagraphAi();
      }
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 p-5 sm:p-7">
        <Card variant="dashed" size="sm" className="flex h-full min-h-0 flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">본문</CardTitle>
            {onRequestParagraphAi ? (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onMouseDown={(e) => e.preventDefault()}
                onClick={onRequestParagraphAi}
                disabled={isSuggestingParagraph}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                title="현재 커서 위치에 AI가 이어서 추천합니다 (단축키: Ctrl + J, 적용: Tab, 취소: Esc)"
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
            ) : null}
          </div>

          <CardContent className="relative min-h-0 flex-1 px-0">
            {isEditorEmpty ? (
              <Textfield
                variant="muted"
                size="default"
                whitespace="preline"
                className="pointer-events-none absolute inset-x-0 top-0 leading-8"
              >
                {bodyPlaceholder}
              </Textfield>
            ) : null}

            <div
              onKeyDown={handleKeyDown}
              className="post-editor-prose h-full min-h-0 overflow-y-auto overflow-x-hidden break-words"
            >
              <EditorContent editor={editor} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Textfield variant="muted" size="sm" className="px-5 pb-5 text-right sm:px-7 sm:pb-6">
        총 {bodyText.length}자
      </Textfield>
    </div>
  );
}

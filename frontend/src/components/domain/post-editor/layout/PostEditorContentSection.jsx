"use client";

// [Section] tiptap 리치 텍스트 에디터를 Card(dashed) 안에 렌더하는 본문 섹션.
// 에디터가 비어 있을 때만 placeholder를 absolute로 겹쳐서 표시한다.
import { EditorContent } from "@tiptap/react";

import { Card, CardContent, CardTitle } from "@/components/common/ui/card";
import { Textfield } from "@/components/common/ui/textfield";

export default function PostEditorContentSection({
  bodyPlaceholder,
  bodyText,   // 글자 수 카운터에 사용
  editor,     // usePostEditorRichText가 반환한 tiptap Editor 인스턴스
  isEditorEmpty,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 p-5 sm:p-7">
        <Card
          variant="dashed"
          size="sm"
          className="flex h-full min-h-0 flex-col gap-4 p-5 sm:p-6"
        >
          <CardTitle className="text-lg">본문</CardTitle>

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

            <div className="post-editor-prose h-full min-h-0 overflow-y-auto overflow-x-hidden break-words">
              <EditorContent editor={editor} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Textfield
        variant="muted"
        size="sm"
        className="px-5 pb-5 text-right sm:px-7 sm:pb-6"
      >
        총 {bodyText.length}자
      </Textfield>
    </div>
  );
}

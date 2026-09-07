"use client";

import PostEditorContentSection from "@/components/domain/post-editor/layout/PostEditorContentSection";
import { postEditorCopy } from "@/data/post-editor/post-editor-copy";
import usePostEditorRichText from "@/hooks/post-editor/post-editor-rich-text";

function ContentSectionDemo({ initialContent = "" }) {
  const richText = usePostEditorRichText({ initialContent });

  return (
    <div className="w-[680px] overflow-hidden rounded-[26px] border-2 border-foreground bg-background">
      <div className="flex h-[480px] min-h-0 flex-col">
        <PostEditorContentSection
          bodyPlaceholder={postEditorCopy.bodyPlaceholder}
          bodyText={richText.bodyText}
          editor={richText.editor}
          isEditorEmpty={richText.isEditorEmpty}
        />
      </div>
    </div>
  );
}

/** @type { import('@storybook/nextjs-vite').Meta } */
const meta = {
  title: "Domain/PostEditor/Layout/PostEditorContentSection",
  component: PostEditorContentSection,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

// 에디터가 비어 있을 때 placeholder가 보이는 상태
export const Empty = {
  render: () => <ContentSectionDemo />,
};

// 에디터에 초기 본문이 있고 글자 수 카운터가 갱신되는 상태
export const WithContent = {
  render: () => (
    <ContentSectionDemo initialContent="행사 운영 일정과 부스 배치 변경 사항을 먼저 안내하는 예시 본문입니다. 현장 동선과 참여 시간, 주의 사항을 확인해 주세요. #일정 #안내" />
  ),
};

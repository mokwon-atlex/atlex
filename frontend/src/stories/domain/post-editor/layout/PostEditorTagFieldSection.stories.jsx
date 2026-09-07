"use client";

import PostEditorTagFieldSection from "@/components/domain/post-editor/layout/PostEditorTagFieldSection";
import { postEditorCopy } from "@/data/post-editor/post-editor-copy";
import usePostEditorTags from "@/hooks/post-editor/post-editor-tags";

// usePostEditorTags 훅을 실제로 사용하는 인터랙티브 래퍼
function TagFieldSectionDemo({ body = "", initialManualTags = [] }) {
  const tagField = usePostEditorTags(body, { initialManualTags });

  return (
    <div className="w-[640px] overflow-hidden rounded-[26px] border-2 border-foreground bg-background">
      <PostEditorTagFieldSection
        tagField={tagField}
        tagPlaceholder={postEditorCopy.tagPlaceholder}
      />
    </div>
  );
}

/** @type { import('@storybook/nextjs-vite').Meta } */
const meta = {
  title: "Domain/PostEditor/Layout/PostEditorTagFieldSection",
  component: PostEditorTagFieldSection,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

// Enter로 태그 추가, Backspace로 마지막 태그 삭제 동작 확인
export const Default = {
  render: () => (
    <TagFieldSectionDemo initialManualTags={["공지", "운영"]} />
  ),
};

export const Empty = {
  render: () => <TagFieldSectionDemo />,
};

// 본문에 #해시가 있으면 bodyTags로 자동 감지되어 automatic 칩으로 표시됨
export const WithBodyTags = {
  render: () => (
    <TagFieldSectionDemo
      body="행사 일정과 부스 배치 #일정 #안내를 확인하세요."
      initialManualTags={["공지"]}
    />
  ),
};

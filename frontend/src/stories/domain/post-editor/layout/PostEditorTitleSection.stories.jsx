"use client";

import { useState } from "react";

import PostEditorTitleSection from "@/components/domain/post-editor/layout/PostEditorTitleSection";
import { postEditorCopy } from "@/data/post-editor/post-editor-copy";
import usePostEditorTags from "@/hooks/post-editor/post-editor-tags";

function TitleSectionDemo({ initialTitle = "", initialManualTags = [] }) {
  const [title, setTitle] = useState(initialTitle);
  const tagField = usePostEditorTags("", { initialManualTags });

  return (
    <div className="w-[680px] overflow-hidden rounded-[26px] border-2 border-foreground bg-background">
      <PostEditorTitleSection
        title={title}
        titlePlaceholder={postEditorCopy.titlePlaceholder}
        tagField={tagField}
        tagPlaceholder={postEditorCopy.tagPlaceholder}
        onTitleChange={setTitle}
      />
    </div>
  );
}

/** @type { import('@storybook/nextjs-vite').Meta } */
const meta = {
  title: "Domain/PostEditor/Layout/PostEditorTitleSection",
  component: PostEditorTitleSection,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

export const Default = {
  render: () => <TitleSectionDemo />,
};

export const WithContent = {
  render: () => (
    <TitleSectionDemo
      initialTitle="벚꽃 축제 운영 일정 안내"
      initialManualTags={["공지", "운영"]}
    />
  ),
};

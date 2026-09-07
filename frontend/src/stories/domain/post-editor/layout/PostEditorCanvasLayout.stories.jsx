"use client";

// PostEditorCanvasLayout 스토리
//
import PostEditorCanvasLayout from "@/components/domain/post-editor/layout/PostEditorCanvasLayout";
import PostEditorToolRail from "@/components/domain/post-editor/layout/PostEditorToolRail";
import { postEditorToolCategories } from "@/data/post-editor/post-editor-tool-categories";

const mockGetItemState = (groupId) => ({
  isActive: false,
  isDisabled: groupId === "font-color",
});

function CanvasLayoutDemo() {
  return (
    <PostEditorCanvasLayout
      content={
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          본문 에디터 영역
        </div>
      }
      toolRail={
        <PostEditorToolRail
          getItemState={mockGetItemState}
          onExecuteItem={() => {}}
          toolCategories={postEditorToolCategories}
        />
      }
    />
  );
}

/** @type { import('@storybook/nextjs-vite').Meta } */
const meta = {
  title: "Domain/PostEditor/Layout/PostEditorCanvasLayout",
  component: PostEditorCanvasLayout,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;

export const DockClosed = {
  render: () => <CanvasLayoutDemo />,
};

export const DockOpen = {
  render: () => <CanvasLayoutDemo />,
};

"use client";

import PostEditorSidebar from "@/components/domain/post-editor/layout/PostEditorSidebar";
import { postEditorToolCategories } from "@/data/post-editor/post-editor-tool-categories";
import usePostEditorPanels from "@/hooks/post-editor/post-editor-panels";

// getItemState 목 — 실제 tiptap 없이 상태를 시뮬레이션한다
const mockGetItemState = (groupId, item) => ({
  isActive: item === "볼드",           // 볼드만 활성 상태처럼 표시
  isDisabled: groupId === "font-color", // 색상 그룹은 항상 비활성
});

function SidebarDemo({ initialGroupId = "font-style", initialToolId = "text-style" }) {
  const { activeGroup, activeTool, closeToolPanel, onSelectGroup, selectGroup } =
    usePostEditorPanels(postEditorToolCategories, {
      initialGroupId,
      initialOpen: true,
      initialToolId,
    });

  return (
    <div className="h-[600px] w-[360px] overflow-hidden rounded-2xl border border-border bg-background">
      <PostEditorSidebar
        activeGroup={activeGroup}
        activeTool={activeTool}
        getItemState={mockGetItemState}
        onClose={closeToolPanel}
        onExecuteItem={(groupId, item) => alert(`실행: [${groupId}] ${item}`)}
        onSelectGroup={selectGroup}
      />
    </div>
  );
}

/** @type { import('@storybook/nextjs-vite').Meta } */
const meta = {
  title: "Domain/PostEditor/Layout/PostEditorSidebar",
  component: PostEditorSidebar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

// 기본 스타일 그룹 — 볼드 활성, 나머지 비활성
export const FontStyle = {
  render: () => <SidebarDemo initialGroupId="font-style" initialToolId="text-style" />,
};

// 색상 그룹 — 모든 버튼 비활성 + warning Alert 표시
export const FontColor = {
  render: () => <SidebarDemo initialGroupId="font-color" initialToolId="text-style" />,
};

// 제목/문단 툴
export const Heading = {
  render: () => <SidebarDemo initialGroupId="heading-level" initialToolId="heading" />,
};

// 삽입/편집 툴
export const InsertEdit = {
  render: () => <SidebarDemo initialGroupId="insert-basic" initialToolId="insert-edit" />,
};

import PostEditorToolPopover from "@/components/domain/post-editor/layout/PostEditorToolPopover"
import { postEditorToolCategories } from "@/data/post-editor/post-editor-tool-categories"

// getItemState 목 — 실제 tiptap 없이 상태를 시뮬레이션한다
const mockGetItemState = (groupId, item) => ({
  isActive: item === "볼드",
  isDisabled: false,
})

const mockGetItemStateWithDisabled = (groupId, item) => ({
  isActive: item === "볼드",
  isDisabled: groupId === "font-color",
})

/** @type { import('@storybook/nextjs-vite').Meta<typeof PostEditorToolPopover> } */
const meta = {
  title: "Domain/PostEditor/Layout/PostEditorToolPopover",
  component: PostEditorToolPopover,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    onExecuteItem: { action: "executeItem" },
  },
}

export default meta

// 글씨체 툴 (Type 아이콘)
export const TextStyle = {
  render: (args) => (
    <div className="flex items-center justify-center p-12">
      <PostEditorToolPopover {...args} />
    </div>
  ),
  args: {
    tool: postEditorToolCategories[0],
    getItemState: mockGetItemState,
  },
}

// 제목/문단 툴 (Heading 아이콘)
export const Heading = {
  render: (args) => (
    <div className="flex items-center justify-center p-12">
      <PostEditorToolPopover {...args} />
    </div>
  ),
  args: {
    tool: postEditorToolCategories[1],
    getItemState: mockGetItemState,
  },
}

// 삽입/편집 툴 (PenLine 아이콘)
export const InsertEdit = {
  render: (args) => (
    <div className="flex items-center justify-center p-12">
      <PostEditorToolPopover {...args} />
    </div>
  ),
  args: {
    tool: postEditorToolCategories[2],
    getItemState: mockGetItemState,
  },
}

// 일부 버튼이 비활성화된 상태
export const WithDisabledItems = {
  render: (args) => (
    <div className="flex items-center justify-center p-12">
      <PostEditorToolPopover {...args} />
    </div>
  ),
  args: {
    tool: postEditorToolCategories[0],
    getItemState: mockGetItemStateWithDisabled,
  },
}

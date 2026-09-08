'use client';

import PostEditorToolRail from '@/components/domain/post-editor/layout/PostEditorToolRail';
import { postEditorToolCategories } from '@/data/post-editor/post-editor-tool-categories';

const mockGetItemState = () => ({
  isActive: false,
  isDisabled: false,
});

function ToolRailDemo() {
  return (
    <div className="flex h-14 w-[640px] overflow-hidden rounded-2xl border border-border bg-slate-100/70">
      <PostEditorToolRail
        getItemState={mockGetItemState}
        onExecuteItem={() => {}}
        toolCategories={postEditorToolCategories}
      />
    </div>
  );
}

/** @type { import('@storybook/nextjs-vite').Meta } */
const meta = {
  title: 'Domain/PostEditor/Layout/PostEditorToolRail',
  component: PostEditorToolRail,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;

export const Default = {
  render: () => <ToolRailDemo />,
};

export const WithSelection = {
  render: () => <ToolRailDemo />,
};

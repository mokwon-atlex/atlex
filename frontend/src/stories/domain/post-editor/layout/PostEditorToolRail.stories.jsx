'use client';

import { expect, within } from 'storybook/test';

import PostEditorToolRail from '@/components/domain/post-editor/layout/PostEditorToolRail';
import { postEditorToolCategories } from '@/data/post-editor/post-editor-tool-categories';

const mockGetItemState = () => ({
  isActive: false,
  isDisabled: false,
});

function ToolRailDemo() {
  return (
    <div className="flex min-h-14 w-[760px] max-w-full overflow-hidden rounded-2xl border border-border bg-slate-100/70">
      <PostEditorToolRail
        getItemState={mockGetItemState}
        onExecuteItem={() => {}}
        onRequestParagraphAi={() => {}}
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
  /** 더보기 없이 모든 서식·삽입·편집 도구와 상단 AI 작성 도구가 노출되는지 검증한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('button', { name: '서식 도구 더보기' })).toBeNull();
    await expect(canvas.getByRole('button', { name: /AI 블록 삽입/ })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /AI 이어쓰기/ })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '밑줄' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '왼쪽 정렬' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '표' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '코드 블록' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '수식(LaTeX)' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '토글 섹션' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '실행 취소' })).toBeVisible();
  },
};

export const WithSelection = {
  render: () => <ToolRailDemo />,
};

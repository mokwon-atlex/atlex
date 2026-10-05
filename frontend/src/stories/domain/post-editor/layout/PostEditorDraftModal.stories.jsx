'use client';

import { useState } from 'react';

import { Button } from '@/components/common/ui/button';
import PostEditorDraftModal from '@/components/domain/post-editor/layout/PostEditorDraftModal';

const mockDrafts = [
  {
    id: '1',
    title: '첫 번째 임시저장 글',
    updatedAt: '2024-03-20T10:00:00Z',
    body: '첫 번째 임시저장 글의 본문 미리보기입니다.',
  },
  {
    id: '2',
    title: '두 번째 임시저장 글',
    updatedAt: '2024-03-21T15:30:00Z',
    body: '두 번째 임시저장 글의 본문 미리보기입니다.',
  },
];

function DraftModalDemo({ drafts = mockDrafts }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        임시 저장 목록 열기
      </Button>
      <PostEditorDraftModal
        drafts={drafts}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onLoadDraft={(draft) => {
          alert(`로드: ${draft.title}`);
          setIsOpen(false);
        }}
        onDeleteDraft={(draft) => alert(`삭제: ${draft.title}`)}
      />
    </>
  );
}

/** @type { import('@storybook/nextjs-vite').Meta<typeof PostEditorDraftModal> } */
const meta = {
  title: 'Domain/PostEditor/Layout/PostEditorDraftModal',
  component: PostEditorDraftModal,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;

export const Default = {
  render: () => <DraftModalDemo />,
};

export const Empty = {
  render: () => <DraftModalDemo drafts={[]} />,
};

export const SingleDraft = {
  render: () => <DraftModalDemo drafts={[mockDrafts[0]]} />,
};

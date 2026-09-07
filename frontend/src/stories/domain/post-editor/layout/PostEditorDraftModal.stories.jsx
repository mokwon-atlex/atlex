"use client";

import { useState } from "react";

import { Button } from "@/components/common/ui/button";
import PostEditorDraftModal from "@/components/domain/post-editor/layout/PostEditorDraftModal";
import { postEditorDrafts } from "@/data/post-editor/post-editor-drafts";

function DraftModalDemo({ drafts = postEditorDrafts }) {
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
  title: "Domain/PostEditor/Layout/PostEditorDraftModal",
  component: PostEditorDraftModal,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

export const Default = {
  render: () => <DraftModalDemo />,
};

export const Empty = {
  render: () => <DraftModalDemo drafts={[]} />,
};

export const SingleDraft = {
  render: () => <DraftModalDemo drafts={[postEditorDrafts[0]]} />,
};

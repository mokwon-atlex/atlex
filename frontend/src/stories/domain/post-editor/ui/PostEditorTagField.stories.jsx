'use client';

import { useState } from 'react';

import PostEditorTagField from '@/components/domain/post-editor/ui/PostEditorTagField';

const SAMPLE_TAGS = [
  { id: 't-1', label: '공지', variant: 'manual' },
  { id: 't-2', label: '운영', variant: 'manual' },
  { id: 't-3', label: '이벤트', variant: 'automatic' }
];

function TagFieldDemo({ initialTags = SAMPLE_TAGS }) {
  const [tags, setTags] = useState(initialTags);
  const [tagInput, setTagInput] = useState('');

  const handleKeyDown = e => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setTags(prev => [
        ...prev,
        { id: `t-${Date.now()}`, label: tagInput.trim(), variant: 'manual' }
      ]);
      setTagInput('');
    }
  };

  const withRemove = tags.map(tag =>
    tag.variant === 'manual'
      ? {
          ...tag,
          onRemove: () => setTags(prev => prev.filter(t => t.id !== tag.id))
        }
      : tag
  );

  const manualCount = tags.filter(t => t.variant === 'manual').length;
  const autoTags = tags.filter(t => t.variant === 'automatic');

  return (
    <PostEditorTagField
      countLabel={`${tags.length}개`}
      detectedTagsLabel={
        autoTags.length
          ? `본문에서 감지된 태그: ${autoTags.map(t => `#${t.label}`).join(', ')}`
          : null
      }
      inputPlaceholder="태그를 입력하세요"
      onTagInputChange={setTagInput}
      onTagInputKeyDown={handleKeyDown}
      tagInput={tagInput}
      tags={withRemove}
    />
  );
}

/** @type { import('@storybook/nextjs-vite').Meta } */
const meta = {
  title: 'Domain/PostEditor/UI/PostEditorTagField',
  component: PostEditorTagField,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  }
};

export default meta;

export const Default = {
  render: () => (
    <div className="w-[600px]">
      <TagFieldDemo />
    </div>
  )
};

export const Empty = {
  render: () => (
    <div className="w-[600px]">
      <TagFieldDemo initialTags={[]} />
    </div>
  )
};

export const AutomaticOnly = {
  render: () => (
    <div className="w-[600px]">
      <TagFieldDemo
        initialTags={[
          { id: 'a-1', label: '일정', variant: 'automatic' },
          { id: 'a-2', label: '안내', variant: 'automatic' }
        ]}
      />
    </div>
  )
};

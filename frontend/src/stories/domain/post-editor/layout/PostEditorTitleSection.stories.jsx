'use client';

import { useState } from 'react';

import PostEditorTitleSection from '@/components/domain/post-editor/layout/PostEditorTitleSection';
import { postEditorCopy } from '@/data/post-editor/post-editor-copy';

function TitleSectionDemo({
  categoryName = '개발',
  initialTitle = '',
  isPublic = true,
  titleSuggestion = '',
  isSuggestingTitle = false,
}) {
  const [title, setTitle] = useState(initialTitle);

  return (
    <div className="w-[680px] overflow-hidden rounded-[26px] border-2 border-foreground bg-background">
      <PostEditorTitleSection
        categoryName={categoryName}
        isPublic={isPublic}
        title={title}
        titlePlaceholder={postEditorCopy.titlePlaceholder}
        onTitleChange={setTitle}
        titleSuggestion={titleSuggestion}
        isSuggestingTitle={isSuggestingTitle}
      />
    </div>
  );
}

/** @type { import('@storybook/nextjs-vite').Meta } */
const meta = {
  title: 'Domain/PostEditor/Layout/PostEditorTitleSection',
  component: PostEditorTitleSection,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;

export const Default = {
  render: () => <TitleSectionDemo />,
};

export const WithContent = {
  render: () => <TitleSectionDemo initialTitle="벚꽃 축제 운영 일정 안내" categoryName="공지" />,
};

export const WithAiSuggestion = {
  render: () => (
    <TitleSectionDemo
      initialTitle="스프링 부트와 "
      categoryName="AI"
      titleSuggestion="Gemini AI로 블로그 자동완성 만들기"
    />
  ),
};

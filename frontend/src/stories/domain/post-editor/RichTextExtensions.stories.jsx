import { resolveExtensions } from '@tiptap/core';
import { expect } from 'storybook/test';

import { editorExtensions } from '@/lib/post-editor/rich-text-extensions';

/** 에디터 확장 구성을 검증하기 위한 빈 화면을 렌더링한다. */
function RichTextExtensionsTestView() {
  return <div>에디터 확장 구성 검증</div>;
}

/** 링크와 밑줄 확장이 기존 링크 옵션을 유지하며 한 번씩 등록되는지 검증한다. */
async function verifySingleExtensionRegistration() {
  const resolvedExtensions = resolveExtensions(editorExtensions);
  const linkExtensions = resolvedExtensions.filter(({ name }) => name === 'link');
  const underlineExtensions = resolvedExtensions.filter(({ name }) => name === 'underline');

  await expect(linkExtensions).toHaveLength(1);
  await expect(underlineExtensions).toHaveLength(1);
  await expect(linkExtensions[0].options).toMatchObject({
    autolink: true,
    defaultProtocol: 'https',
    linkOnPaste: true,
    openOnClick: false,
  });
}

/** @type { import('@storybook/nextjs-vite').Meta } */
const meta = {
  title: 'Domain/PostEditor/RichTextExtensions',
  component: RichTextExtensionsTestView,
};

export default meta;

// 링크와 밑줄 확장을 단일 구성으로 제공하는 상태
export const Default = {
  play: verifySingleExtensionRegistration,
};

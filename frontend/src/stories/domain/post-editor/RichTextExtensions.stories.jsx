import { generateJSON, resolveExtensions } from '@tiptap/core';
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
  const postLinkExtensions = resolvedExtensions.filter(({ name }) => name === 'postLink');

  await expect(linkExtensions).toHaveLength(1);
  await expect(underlineExtensions).toHaveLength(1);
  await expect(postLinkExtensions).toHaveLength(1);
  await expect(linkExtensions[0].options).toMatchObject({
    autolink: true,
    defaultProtocol: 'https',
    linkOnPaste: true,
    openOnClick: true,
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

// 수식 블록 HTML을 다시 파싱할 때 라벨 텍스트가 수식에 섞이지 않는 상태
export const MathBlockParseHtml = {
  play: async () => {
    const html =
      '<div data-type="math-block"><div class="post-editor-block__label">수식 (LaTeX)</div><pre class="post-editor-block__body"><code>\\sum_{i=1}^{n} x_i</code></pre></div>';
    const doc = generateJSON(html, editorExtensions);
    const mathNode = doc.content?.find((node) => node.type === 'mathBlock');

    await expect(mathNode).toBeDefined();
    await expect(mathNode.content?.[0]?.text).toBe('\\sum_{i=1}^{n} x_i');
  },
};

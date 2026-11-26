import { generateJSON, resolveExtensions } from '@tiptap/core';
import { expect } from 'storybook/test';

import { editorExtensions } from '@/lib/post-editor/rich-text-extensions';
import { matchSlashCommandTrigger, shouldShowSlashCommand } from '@/lib/post-editor/rich-text-slash-command-extension';
import {
  TOOLBAR_SHORTCUT_HINT_MAP,
  filterSlashCommands,
  getToolbarShortcutLabel,
  isApplePlatform,
} from '@/lib/post-editor/rich-text-slash-commands';

/** 에디터 확장 구성을 검증하기 위한 빈 화면을 렌더링한다. */
function RichTextExtensionsTestView() {
  return <div>에디터 확장 구성 검증</div>;
}

/** 링크, 밑줄, 내 글 링크, 슬래시 커맨드 확장이 단일 구성으로 등록되는지 검증한다. */
async function verifySingleExtensionRegistration() {
  const resolvedExtensions = resolveExtensions(editorExtensions);
  const linkExtensions = resolvedExtensions.filter(({ name }) => name === 'link');
  const underlineExtensions = resolvedExtensions.filter(({ name }) => name === 'underline');
  const postLinkExtensions = resolvedExtensions.filter(({ name }) => name === 'postLink');
  const slashCommandExtensions = resolvedExtensions.filter(({ name }) => name === 'slashCommand');

  await expect(linkExtensions).toHaveLength(1);
  await expect(underlineExtensions).toHaveLength(1);
  await expect(postLinkExtensions).toHaveLength(1);
  await expect(slashCommandExtensions).toHaveLength(1);
  await expect(linkExtensions[0].options).toMatchObject({
    autolink: true,
    defaultProtocol: 'https',
    linkOnPaste: true,
    openOnClick: true,
  });

  // 슬래시 커맨드 트리거 감지, ESC 재오픈 방지 규칙 및 필터링 동작을 검증한다.
  await expect(matchSlashCommandTrigger('/code')).toEqual({ matchLength: 5, query: 'code' });
  await expect(matchSlashCommandTrigger('본문 /table')).toEqual({ matchLength: 6, query: 'table' });
  await expect(matchSlashCommandTrigger('https://example.com/code')).toBeNull();
  await expect(matchSlashCommandTrigger('a/b')).toBeNull();
  await expect(shouldShowSlashCommand({ dismissedPos: 5, docChanged: true, from: 5, isOpen: false })).toBe(false);
  await expect(shouldShowSlashCommand({ dismissedPos: null, docChanged: false, from: 5, isOpen: false })).toBe(false);
  await expect(shouldShowSlashCommand({ dismissedPos: 5, docChanged: true, from: 12, isOpen: false })).toBe(true);
  await expect(filterSlashCommands('code')[0]?.id).toBe('code-block');
  await expect(filterSlashCommands('표')[0]?.id).toBe('table');
  await expect(TOOLBAR_SHORTCUT_HINT_MAP['볼드']).toEqual({ mac: '⌘+B', win: 'Ctrl+B' });
  await expect(isApplePlatform('MacIntel')).toBe(true);
  await expect(isApplePlatform('Win32')).toBe(false);
  await expect(getToolbarShortcutLabel('볼드', true)).toBe('⌘+B');
  await expect(getToolbarShortcutLabel('볼드', false)).toBe('Ctrl+B');
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

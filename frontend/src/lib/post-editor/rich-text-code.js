import { common, createLowlight } from 'lowlight';
import { escapeHtml } from '@/lib/post-editor/rich-text-utils';

export const editorLowlight = createLowlight(common);

function hastNodeToHtml(node) {
  if (!node) {
    return '';
  }

  if (node.type === 'text') {
    return escapeHtml(node.value ?? '');
  }

  if (node.type === 'root') {
    return (node.children ?? []).map(hastNodeToHtml).join('');
  }

  if (node.type === 'element') {
    const tagName = node.tagName || 'span';
    const classList = Array.isArray(node.properties?.className) ? node.properties.className : [];
    const classAttr = classList.length > 0 ? ` class="${escapeHtml(classList.join(' '))}"` : '';
    const childrenHtml = (node.children ?? []).map(hastNodeToHtml).join('');
    return `<${tagName}${classAttr}>${childrenHtml}</${tagName}>`;
  }

  return '';
}

/**
 * 코드 문자열을 lowlight HAST로 하이라이팅한 안전한 HTML 문자열을 반환한다.
 *
 * @param {string} codeText 원본 코드 텍스트
 * @param {string | null | undefined} language 언어 식별자 (예: 'javascript', 'java')
 * @returns {string} 하이라이팅된 HTML 문자열
 */
export function highlightCodeToHtml(codeText, language) {
  if (!codeText) {
    return '';
  }

  const normalizedLang = typeof language === 'string' ? language.trim().toLowerCase() : '';
  const tree =
    normalizedLang && editorLowlight.registered(normalizedLang)
      ? editorLowlight.highlight(normalizedLang, codeText)
      : editorLowlight.highlightAuto(codeText);

  return hastNodeToHtml(tree);
}

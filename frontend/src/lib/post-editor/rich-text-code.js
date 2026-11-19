import { common, createLowlight } from 'lowlight';
import { escapeHtml } from '@/lib/post-editor/rich-text-utils';

export const editorLowlight = createLowlight(common);

/**
 * 노션 스타일 코드 블록에서 선택 가능한 언어 목록.
 */
export const CODE_LANGUAGE_OPTIONS = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'mermaid', label: 'Mermaid' },
];

const LANGUAGE_ALIAS_MAP = {
  html: 'xml',
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  md: 'markdown',
  'c++': 'cpp',
  text: 'plaintext',
  txt: 'plaintext',
};

const LANGUAGE_LABEL_MAP = {
  plaintext: 'Plain Text',
  c: 'C',
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  html: 'HTML',
  xml: 'HTML / XML',
  css: 'CSS',
  python: 'Python',
  py: 'Python',
  sql: 'SQL',
  bash: 'Bash',
  sh: 'Bash',
  shell: 'Bash',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  markdown: 'Markdown',
  md: 'Markdown',
  mermaid: 'Mermaid',
};

/**
 * 에디터/마크다운의 언어 식별자를 표시용 라벨로 변환한다.
 *
 * @param {string | null | undefined} language 언어 식별자
 * @returns {string} 화면 표시용 언어 이름
 */
export function getCodeLanguageLabel(language) {
  const key = typeof language === 'string' ? language.trim().toLowerCase() : '';
  if (!key) {
    return 'Plain Text';
  }
  return LANGUAGE_LABEL_MAP[key] || key.toUpperCase();
}

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
 * @param {string | null | undefined} language 언어 식별자 (예: 'javascript', 'java', 'html', 'c')
 * @returns {string} 하이라이팅된 HTML 문자열
 */
export function highlightCodeToHtml(codeText, language) {
  if (!codeText) {
    return '';
  }

  const rawLang = typeof language === 'string' ? language.trim().toLowerCase() : '';
  const resolvedLang = LANGUAGE_ALIAS_MAP[rawLang] || rawLang;

  if (resolvedLang === 'plaintext' || resolvedLang === 'mermaid') {
    return escapeHtml(codeText);
  }

  const tree =
    resolvedLang && editorLowlight.registered(resolvedLang)
      ? editorLowlight.highlight(resolvedLang, codeText)
      : editorLowlight.highlightAuto(codeText);

  return hastNodeToHtml(tree);
}

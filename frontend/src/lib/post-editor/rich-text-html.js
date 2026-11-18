import sanitizeHtml from 'sanitize-html';

const RICH_TEXT_ALLOWED_TAGS = [
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'del',
  'details',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'hr',
  'i',
  'img',
  'input',
  'label',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'section',
  'span',
  'strong',
  'summary',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
];
const HTML_TAG_PATTERN = new RegExp(`</?(?:${RICH_TEXT_ALLOWED_TAGS.join('|')})\\b[^>]*>`, 'i');
const BLOCK_TAG_PATTERN =
  /<\/?(?:blockquote|br|div|h[1-3]|li|ol|p|pre|section|summary|table|tbody|td|th|thead|tr|ul)\b[^>]*>/gi;
const HTML_ENTITIES = {
  '&amp;': '&',
  '&gt;': '>',
  '&lt;': '<',
  '&nbsp;': ' ',
  '&quot;': '"',
  '&#39;': "'",
};

const RICH_TEXT_SANITIZE_OPTIONS = {
  allowedTags: RICH_TEXT_ALLOWED_TAGS,
  allowedAttributes: {
    a: ['href', { name: 'target', values: ['_blank'] }, 'rel', 'download', 'data-file-attachment'],
    code: ['class'],
    details: ['data-type', 'open', 'style'],
    div: ['data-type', 'style', 'class'],
    h1: ['style'],
    h2: ['style'],
    h3: ['style'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    input: [{ name: 'type', values: ['checkbox'] }, 'checked', 'disabled'],
    li: ['data-type', 'data-checked', 'style'],
    ol: ['start', 'style'],
    p: ['data-type', 'style'],
    pre: ['class'],
    section: ['data-type', 'style'],
    span: ['class'],
    summary: ['style', 'class'],
    table: ['style'],
    td: ['colspan', 'rowspan', 'style'],
    th: ['colspan', 'rowspan', 'style'],
    ul: ['data-type', 'style'],
  },
  allowedClasses: {
    code: ['language-*'],
    div: ['post-editor-block__label', 'post-editor-block__body'],
    pre: ['post-editor-block__body'],
    span: ['hljs-*'],
    summary: ['post-editor-block__summary'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['http', 'https'],
  },
  allowedStyles: {
    '*': {
      'text-align': [/^(left|right|center|justify)$/],
    },
  },
  transformTags: {
    a: transformAnchorTag,
  },
};

/**
 * 새 창 링크에 탭 전환 공격 방지 속성을 추가하고, 그 외 링크에는 불필요한 속성을 제거한다.
 * @param {string} tagName 정제 중인 태그 이름
 * @param {Record<string, string>} attributes 정제된 링크 속성
 * @returns {{ tagName: string, attribs: Record<string, string> }} 렌더링할 링크 태그 정보
 */
function transformAnchorTag(tagName, attributes) {
  if (attributes.target !== '_blank') {
    delete attributes.target;
    delete attributes.rel;
    return { tagName, attribs: attributes };
  }

  return {
    tagName,
    attribs: {
      ...attributes,
      rel: 'noopener noreferrer',
    },
  };
}

/**
 * 게시글 본문이 HTML 태그를 포함하는지 확인한다.
 * @param {string | null | undefined} content 게시글 본문 원본
 * @returns {boolean} 리치 텍스트 HTML 여부
 */
export function hasRichTextHtml(content) {
  return typeof content === 'string' && HTML_TAG_PATTERN.test(content);
}

/**
 * TipTap에서 생성한 HTML 중 상세 화면에서 지원하는 태그와 속성만 남긴다.
 * @param {string | null | undefined} html 저장된 게시글 본문
 * @returns {string} 안전하게 렌더링할 HTML
 */
export function sanitizeRichTextHtml(html) {
  return sanitizeHtml(html ?? '', RICH_TEXT_SANITIZE_OPTIONS);
}

/**
 * HTML 본문을 상세 화면 요약과 읽기 시간 계산에 사용할 일반 텍스트로 바꾼다.
 * @param {string | null | undefined} html 저장된 게시글 본문
 * @returns {string} 태그를 제거한 일반 텍스트
 */
export function getRichTextPlainText(html) {
  const text = sanitizeRichTextHtml(html)
    .replace(BLOCK_TAG_PATTERN, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(amp|gt|lt|nbsp|quot|#39);/g, (entity) => HTML_ENTITIES[entity]);

  return text.replace(/\s+/g, ' ').trim();
}

const PREVIEW_EXCLUDED_TAGS = new Set(['pre', 'table', 'details']);

const PREVIEW_SANITIZE_OPTIONS = {
  ...RICH_TEXT_SANITIZE_OPTIONS,
  exclusiveFilter: (frame) =>
    PREVIEW_EXCLUDED_TAGS.has(frame.tag) || (frame.tag === 'div' && frame.attribs?.['data-type'] === 'math-block'),
};

/**
 * 카드 미리보기와 설명 생성에 사용할 수 있도록 수식·표·코드 블록·토글을 제외한 본문 텍스트만 추출한다.
 * @param {string | null | undefined} html 저장된 게시글 본문
 * @returns {string} 비텍스트 블록이 제거된 일반 텍스트
 */
export function getRichTextPreviewText(html) {
  const withoutBlocks = sanitizeHtml(html ?? '', PREVIEW_SANITIZE_OPTIONS);
  const text = withoutBlocks
    .replace(BLOCK_TAG_PATTERN, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(amp|gt|lt|nbsp|quot|#39);/g, (entity) => HTML_ENTITIES[entity]);

  return text.replace(/\s+/g, ' ').trim();
}

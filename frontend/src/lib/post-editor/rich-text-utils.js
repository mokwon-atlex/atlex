// 리치 텍스트 편집기에서 여러 파일이 공통으로 쓰는 작은 유틸 함수들이다.

export function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function createInitialContent(value) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '<p></p>';
  }

  // 기존 초안 데이터는 일반 문자열이라서, 에디터가 이해할 수 있는 기본 문단 HTML로 바꿔서 넣는다.
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('');
}

export function normalizeUrl(value) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '';
  }

  if (/^(https?:|mailto:|tel:|\/|#)/i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

export function getSelectionSnapshot(editor) {
  const { from, to } = editor.state.selection;

  return { from, to };
}

export function getSelectedText(editor, selection) {
  return editor.state.doc.textBetween(selection.from, selection.to, ' ').trim();
}

export function restoreSelection(editor, selection) {
  return editor.chain().focus().setTextSelection(selection);
}

export function parsePositiveInteger(value, fallbackValue) {
  const parsedValue = Number.parseInt(value ?? '', 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return fallbackValue;
  }

  return parsedValue;
}

export function createBlockContent(text) {
  return [
    {
      type: 'paragraph',
      content: [{ type: 'text', text }],
    },
  ];
}

/**
 * 문서가 텍스트나 특수 블록 없이 순수 빈 기본 문단(`<p></p>`) 1개로만 이루어져 있는지 판별한다.
 * 인용문·리드 문단·캡션·제목·코드 블록·표·토글·구분선 등이 하나라도 시작되면 글자를 치기 전이라도
 * placeholder를 숨기기 위해 false를 반환한다.
 *
 * @param {import('@tiptap/pm/model').Node | null | undefined} doc ProseMirror 문서 노드
 * @returns {boolean} 초기 빈 문단 상태 여부
 */
export function isPlainEmptyDocument(doc) {
  if (!doc) {
    return true;
  }

  // 최상위 블록이 2개 이상이면 빈 줄이 여러 개 있거나 블록이 추가된 상태이므로 placeholder 숨김
  if (doc.childCount !== 1) {
    return false;
  }

  const firstChild = doc.firstChild;
  if (!firstChild) {
    return true;
  }

  // 기본 paragraph 가 아니거나(blockquote, heading, leadParagraph, captionParagraph 등) 내용이 있으면 false
  if (firstChild.type?.name !== 'paragraph' || firstChild.content.size > 0) {
    return false;
  }

  return true;
}

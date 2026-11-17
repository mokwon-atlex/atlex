import katex from 'katex';

/**
 * LaTeX 문자열을 KaTeX HTML 문자열로 변환한다.
 * 문법 오류가 있어도 에디터나 상세 화면이 깨지지 않도록 throwOnError를 끈다.
 *
 * @param {string} latex 변환할 LaTeX 수식 문자열
 * @returns {string} 렌더링된 HTML 문자열
 */
export function renderLatexToHtml(latex) {
  const trimmed = (latex ?? '').trim();

  if (!trimmed) {
    return '';
  }

  try {
    return katex.renderToString(trimmed, {
      displayMode: true,
      throwOnError: false,
      strict: false,
    });
  } catch {
    return '';
  }
}

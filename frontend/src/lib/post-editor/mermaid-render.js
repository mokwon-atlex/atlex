let initialized = false;

/**
 * Mermaid 다이어그램 소스를 안전한 SVG 문자열로 렌더링한다.
 *
 * @param {string} source Mermaid 다이어그램 코드
 * @param {string} renderId DOM 충돌을 피하기 위한 고유 렌더 ID
 * @returns {Promise<string>} 렌더링된 SVG HTML 문자열
 */
export async function renderMermaidSvg(source, renderId) {
  const trimmed = typeof source === 'string' ? source.trim() : '';
  if (!trimmed) {
    return '';
  }

  const mermaidModule = await import('mermaid');
  const mermaid = mermaidModule.default ?? mermaidModule;

  if (!initialized) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'default',
    });
    initialized = true;
  }

  const { svg } = await mermaid.render(renderId, trimmed);
  return svg;
}

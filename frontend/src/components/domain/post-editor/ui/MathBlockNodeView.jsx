'use client';

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import katex from 'katex';
import { useMemo } from 'react';

/**
 * 에디터 내부에서 LaTeX 수식을 입력하면서 동시에 KaTeX 렌더링 결과를 미리 본다.
 */
export default function MathBlockNodeView({ node }) {
  const latexText = node.textContent ?? '';

  const renderedHtml = useMemo(() => {
    const trimmed = latexText.trim();
    if (!trimmed) {
      return '';
    }
    return katex.renderToString(trimmed, {
      displayMode: true,
      throwOnError: false,
    });
  }, [latexText]);

  return (
    <NodeViewWrapper className="post-editor-math-block" data-type="math-block">
      <div className="post-editor-block__label" contentEditable={false}>
        수식 (LaTeX)
      </div>
      <pre className="post-editor-block__body">
        <NodeViewContent as="code" />
      </pre>
      <div
        className="post-editor-math-block__preview"
        contentEditable={false}
        dangerouslySetInnerHTML={{
          __html: renderedHtml || '<span class="post-editor-math-block__empty">LaTeX 수식을 입력하세요.</span>',
        }}
      />
    </NodeViewWrapper>
  );
}

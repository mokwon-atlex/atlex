'use client';

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { Check, Copy, Eye, Code2 } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { renderMermaidSvg } from '@/lib/post-editor/mermaid-render';
import { CODE_LANGUAGE_OPTIONS } from '@/lib/post-editor/rich-text-code';

/**
 * 노션 스타일 코드 블록 NodeView.
 * 언어 선택 드롭다운, 복사 버튼, Mermaid 다이어그램 실시간 미리보기를 제공한다.
 */
export default function CodeBlockNodeView({ node, updateAttributes }) {
  const currentLanguage = (node.attrs?.language || 'plaintext').toLowerCase();
  const isMermaid = currentLanguage === 'mermaid';
  const codeText = node.textContent ?? '';
  const reactId = useId().replace(/:/g, '');

  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [mermaidSvg, setMermaidSvg] = useState('');
  const [mermaidError, setMermaidError] = useState('');

  useEffect(() => {
    if (!isMermaid || !showPreview) {
      return;
    }

    let cancelled = false;
    const trimmed = codeText.trim();
    if (!trimmed) {
      setMermaidSvg('');
      setMermaidError('');
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const svg = await renderMermaidSvg(trimmed, `mermaid-editor-${reactId}-${Date.now()}`);
        if (!cancelled) {
          setMermaidSvg(svg);
          setMermaidError('');
        }
      } catch (err) {
        if (!cancelled) {
          setMermaidSvg('');
          setMermaidError(err?.message || 'Mermaid 문법을 확인해 주세요.');
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [codeText, isMermaid, reactId, showPreview]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 권한이 없는 환경에서는 무시한다.
    }
  };

  return (
    <NodeViewWrapper className="my-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-xs">
      <div
        contentEditable={false}
        className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-100/80 px-3 py-1.5 text-xs text-slate-600 select-none"
      >
        <select
          aria-label="코드 블록 언어 선택"
          value={CODE_LANGUAGE_OPTIONS.some((opt) => opt.value === currentLanguage) ? currentLanguage : 'plaintext'}
          onChange={(e) => updateAttributes({ language: e.target.value })}
          className="cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 outline-none hover:border-slate-300 focus:border-slate-400"
        >
          {CODE_LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          {isMermaid ? (
            <button
              type="button"
              onClick={() => setShowPreview((prev) => !prev)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-900"
            >
              {showPreview ? <Code2 className="size-3.5" /> : <Eye className="size-3.5" />}
              {showPreview ? '미리보기 숨김' : '다이어그램 보기'}
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-900"
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            {copied ? '복사됨' : '복사'}
          </button>
        </div>
      </div>

      <pre className="!m-0 !max-h-[26rem] !overflow-auto !rounded-none !border-0 !bg-transparent !px-4 !py-3 !text-[0.875rem] !leading-6">
        <NodeViewContent as="code" />
      </pre>

      {isMermaid && showPreview ? (
        <div contentEditable={false} className="border-t border-slate-200 bg-white px-4 py-3 text-center">
          {mermaidError ? (
            <p className="text-xs text-rose-600">{mermaidError}</p>
          ) : mermaidSvg ? (
            <div
              className="flex justify-center overflow-x-auto [&>svg]:max-h-[24rem] [&>svg]:max-w-full"
              dangerouslySetInnerHTML={{ __html: mermaidSvg }}
            />
          ) : (
            <p className="text-xs text-slate-400">Mermaid 다이어그램 코드를 입력하면 실시간으로 렌더링됩니다.</p>
          )}
        </div>
      ) : null}
    </NodeViewWrapper>
  );
}

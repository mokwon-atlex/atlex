'use client';

import { NodeViewWrapper } from '@tiptap/react';
import { AlignCenter, AlignLeft, AlignRight, Trash2 } from 'lucide-react';
import { useState } from 'react';

const SIZE_PRESETS = [
  { label: '25%', value: '25%' },
  { label: '50%', value: '50%' },
  { label: '75%', value: '75%' },
  { label: '100%', value: '100%' },
];

const ALIGN_OPTIONS = [
  { label: '왼쪽 정렬', value: 'left', icon: AlignLeft },
  { label: '가운데 정렬', value: 'center', icon: AlignCenter },
  { label: '오른쪽 정렬', value: 'right', icon: AlignRight },
];

/**
 * 에디터 내 이미지 노드 뷰.
 * 선택 또는 호버 시 크기 조절(25%, 50%, 75%, 100%) 및 정렬(좌, 중, 우), 삭제 툴바를 제공한다.
 */
export default function ResizableImageNodeView({ node, updateAttributes, deleteNode, selected }) {
  const [isHovered, setIsHovered] = useState(false);
  const src = node.attrs?.src;
  const alt = node.attrs?.alt || '';
  const width = node.attrs?.width || '100%';
  const alignment = node.attrs?.alignment || 'center';

  const showToolbar = selected || isHovered;

  const containerAlignClass =
    alignment === 'left' ? 'mr-auto ml-0' : alignment === 'right' ? 'ml-auto mr-0' : 'mx-auto';

  return (
    <NodeViewWrapper
      as="figure"
      className="group relative my-4 block select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative flex flex-col ${containerAlignClass}`} style={{ width, maxWidth: '100%' }}>
        {/* 이미지 리사이즈 & 정렬 플로팅 툴바 */}
        {showToolbar && (
          <div
            contentEditable={false}
            className={
              'absolute -top-11 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 ' +
              'rounded-lg border border-border/80 bg-background/95 px-2 py-1 shadow-md ' +
              'backdrop-blur-md transition-opacity duration-150 animate-in fade-in ' +
              'dark:border-zinc-700 dark:bg-zinc-900/95'
            }
          >
            {/* 크기 프리셋 버튼들 */}
            <div className="mr-1 flex items-center gap-0.5 border-r border-border/60 pr-1 dark:border-zinc-700">
              {SIZE_PRESETS.map((preset) => {
                const isActive = width === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => updateAttributes({ width: preset.value })}
                    className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                      isActive
                        ? 'bg-primary font-semibold text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* 정렬 버튼들 */}
            <div className="mr-1 flex items-center gap-0.5 border-r border-border/60 pr-1 dark:border-zinc-700">
              {ALIGN_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = alignment === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    title={opt.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => updateAttributes({ alignment: opt.value })}
                    className={`rounded p-1 text-xs transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="size-3.5" />
                  </button>
                );
              })}
            </div>

            {/* 삭제 버튼 */}
            <button
              type="button"
              title="이미지 삭제"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => deleteNode()}
              className={
                'rounded p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-600 ' +
                'dark:text-rose-400 dark:hover:bg-rose-950/40'
              }
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}

        {/* 실제 이미지 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={`h-auto w-full rounded-2xl object-contain transition-all duration-150 ${
            selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
          }`}
        />
        {alt && (
          <figcaption
            contentEditable={false}
            className="mt-1.5 text-center text-xs text-muted-foreground dark:text-zinc-400"
          >
            {alt}
          </figcaption>
        )}
      </div>
    </NodeViewWrapper>
  );
}

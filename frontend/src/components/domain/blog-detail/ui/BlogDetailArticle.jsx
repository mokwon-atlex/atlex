'use client';

import katex from 'katex';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { textfieldVariants } from '@/components/common/ui/textfield';
import { renderMermaidSvg } from '@/lib/post-editor/mermaid-render';
import { getCodeLanguageLabel, highlightCodeToHtml } from '@/lib/post-editor/rich-text-code';
import styles from './BlogDetailArticle.module.css';

/**
 * 게시글 본문의 이미지와 선택적 설명을 렌더링한다.
 * @param {{ src: string, caption?: string }} props 이미지 정보
 * @returns {React.ReactElement} 이미지 블록
 */
function ArticleImage({ src, caption }) {
  return (
    <figure className="space-y-4">
      <div className="overflow-hidden rounded-[1.8rem] border border-border bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={caption || ''} className="h-[280px] w-full object-cover sm:h-[360px]" />
      </div>
      {caption ? <figcaption className="text-[0.86rem] leading-7 text-muted-foreground">{caption}</figcaption> : null}
    </figure>
  );
}

/**
 * 정제된 게시글 HTML을 서식이 유지된 상태로 렌더링한다.
 * 내부 링크 클릭 시 클라이언트 라우터로 페이지를 전환한다.
 * @param {{ html: string, onLinkClick?: (e: React.MouseEvent<HTMLDivElement>) => void }} props 저장된 게시글 HTML
 * @returns {React.ReactElement} 리치 텍스트 본문
 */
function RichTextArticle({ html, onLinkClick }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.querySelectorAll('[data-type="math-block"]').forEach((block) => {
      const codeEl = block.querySelector('code');
      const latexSource = (codeEl?.textContent ?? block.textContent ?? '').trim();
      if (!latexSource) {
        return;
      }

      const bodyEl = block.querySelector('pre');
      if (bodyEl) {
        const rendered = document.createElement('div');
        rendered.className = 'post-editor-block__body';
        rendered.innerHTML = katex.renderToString(latexSource, {
          displayMode: true,
          throwOnError: false,
        });
        bodyEl.replaceWith(rendered);
      }
    });

    let cancelled = false;

    container.querySelectorAll('pre code').forEach((codeEl, index) => {
      if (codeEl.closest('[data-type="math-block"]')) {
        return;
      }
      const preEl = codeEl.closest('pre');
      if (!preEl || preEl.dataset.enhanced === 'true') {
        return;
      }
      const rawCode = codeEl.textContent ?? '';
      if (!rawCode) {
        return;
      }
      preEl.dataset.enhanced = 'true';

      const languageClass = Array.from(codeEl.classList).find((name) => name.startsWith('language-'));
      const language = languageClass ? languageClass.replace('language-', '').toLowerCase() : '';

      if (language === 'mermaid') {
        const wrapper = document.createElement('div');
        wrapper.className = styles.mermaidBlock;

        const header = document.createElement('div');
        header.className = styles.mermaidHeader;
        header.textContent = 'Mermaid';

        const body = document.createElement('div');
        body.className = styles.mermaidBody;
        body.textContent = '다이어그램을 불러오는 중입니다...';

        wrapper.appendChild(header);
        wrapper.appendChild(body);
        preEl.replaceWith(wrapper);

        renderMermaidSvg(rawCode, `mermaid-detail-${index}-${Date.now()}`)
          .then((svg) => {
            if (cancelled) return;
            if (svg) {
              body.innerHTML = svg;
            }
          })
          .catch(() => {
            if (cancelled) return;
            const fallbackPre = document.createElement('pre');
            const fallbackCode = document.createElement('code');
            fallbackCode.textContent = rawCode;
            fallbackPre.appendChild(fallbackCode);
            body.replaceWith(fallbackPre);
          });
        return;
      }

      codeEl.innerHTML = highlightCodeToHtml(rawCode, language);

      const wrapper = document.createElement('div');
      wrapper.className = styles.codeBlockWrapper;

      const header = document.createElement('div');
      header.className = styles.codeBlockHeader;

      const langLabel = document.createElement('span');
      langLabel.className = styles.codeBlockLang;
      langLabel.textContent = getCodeLanguageLabel(language);

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = styles.codeBlockCopyBtn;
      copyBtn.textContent = '복사';
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(rawCode);
          copyBtn.textContent = '복사됨';
          window.setTimeout(() => {
            copyBtn.textContent = '복사';
          }, 1500);
        } catch {
          // 클립보드 권한이 없는 경우 무시한다.
        }
      });

      header.appendChild(langLabel);
      header.appendChild(copyBtn);

      preEl.parentNode?.insertBefore(wrapper, preEl);
      wrapper.appendChild(header);
      wrapper.appendChild(preEl);
    });

    return () => {
      cancelled = true;
    };
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={styles.richText}
      onClick={onLinkClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * 게시글 상세 본문 블록을 유형에 맞춰 렌더링한다.
 * @param {{ contentBlocks: Array<{ id: string, type: string, text?: string, html?: string, src?: string, caption?: string }> }} props 본문 블록 목록
 * @returns {React.ReactElement} 게시글 본문
 */
export default function BlogDetailArticle({ contentBlocks }) {
  const router = useRouter();

  const handleLinkClick = (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href) return;

    // target="_blank" 또는 새 탭 열기(Ctrl, Cmd, Shift, Alt, 휠 클릭)는 기본 동작 유지
    if (
      anchor.target === '_blank' ||
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      e.shiftKey
    ) {
      return;
    }

    // 내부 라우팅 대상: /@username/postId 또는 /u/username/postId 등
    if (href.startsWith('/') && !href.startsWith('//')) {
      e.preventDefault();
      if (router?.push) {
        router.push(href);
      }
      return;
    }

    // 외부 링크는 target="_blank" 속성이 누락된 기존 글에서도 새 탭으로 열리도록 처리
    if (/^https?:\/\//i.test(href)) {
      e.preventDefault();
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article className="space-y-8">
      {contentBlocks.map((block) => {
        // 이미지 블록은 읽기 리듬을 끊어 주면서도 렌더링 분기는 단순하게 유지합니다.
        if (block.type === 'image') {
          return <ArticleImage key={block.id} src={block.src} caption={block.caption} />;
        }

        if (block.type === 'rich-text') {
          return <RichTextArticle key={block.id} html={block.html} onLinkClick={handleLinkClick} />;
        }

        // 그 외 블록은 현재 기본 문단 스타일로 처리합니다.
        return (
          <p
            key={block.id}
            className={textfieldVariants({
              whitespace: 'keep',
              className: 'text-[1rem] leading-9 text-foreground/84 sm:text-[1.05rem]',
            })}
          >
            {block.text}
          </p>
        );
      })}
    </article>
  );
}

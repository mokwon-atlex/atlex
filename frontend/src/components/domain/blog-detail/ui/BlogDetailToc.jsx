'use client';

import { ListTree } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * 게시글 상세 우측 사이드바: 읽기 진행률 바 + 본문 헤딩(h1~h3) 자동 목차(TOC).
 */
export default function BlogDetailToc() {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const article = document.querySelector('article');
    if (!article) {
      return;
    }

    const elements = Array.from(article.querySelectorAll('h1, h2, h3'));
    const collected = elements
      .map((el, index) => {
        const text = (el.textContent ?? '').trim();
        if (!text) return null;
        if (!el.id) {
          el.id = `section-${index + 1}`;
        }
        el.style.scrollMarginTop = '5.5rem';
        return {
          id: el.id,
          text,
          level: Number(el.tagName.replace('H', '')) || 2,
        };
      })
      .filter(Boolean);

    setHeadings(collected);
    if (collected.length > 0) {
      setActiveId(collected[0].id);
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = docHeight > 0 ? Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100))) : 0;
      setProgress(nextProgress);

      if (collected.length === 0) return;
      let current = collected[0].id;
      for (const item of collected) {
        const target = document.getElementById(item.id);
        if (target && target.getBoundingClientRect().top <= 130) {
          current = item.id;
        }
      }
      setActiveId(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = (id) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
  };

  return (
    <aside className="sticky top-24 space-y-4">
      <div className="rounded-xl border border-border bg-card/60 p-3.5">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>읽기 진행률</span>
          <span className="text-foreground">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {headings.length > 0 ? (
        <nav aria-label="본문 목차" className="rounded-xl border border-border bg-card/60 p-3.5">
          <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wide text-foreground">
            <ListTree className="size-3.5 text-primary" />
            <span>목차</span>
          </div>
          <ul className="space-y-1.5">
            {headings.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id} style={{ paddingLeft: `${Math.max(0, item.level - 1) * 10}px` }}>
                  <button
                    type="button"
                    onClick={() => handleClick(item.id)}
                    className={`block w-full cursor-pointer truncate text-left text-xs leading-5 transition-colors ${
                      isActive ? 'font-semibold text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.text}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </aside>
  );
}

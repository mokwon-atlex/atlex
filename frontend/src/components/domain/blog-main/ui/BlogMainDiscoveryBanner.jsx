'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronLeft, ChevronRight, Network, Newspaper, Sparkles } from 'lucide-react';

import { FALLBACK_DEV_TRENDS } from '@/lib/queries/dev-trends';

/** 배너 자동 슬라이드 전환 주기(밀리초). */
const SLIDE_INTERVAL_MS = 7000;

/** 슬라이드 목록 메타데이터. */
const BANNER_SLIDES = [
  { id: 'graph', label: '지식 그래프' },
  { id: 'trends', label: '개발 이슈' },
];

/** 배경에 자연스럽게 녹아드는 지식 그래프 노드 좌표. */
const GRAPH_NODES = [
  { id: 'n1', cx: 590, cy: 26, r: 9, glow: 17, opacity: 0.72 },
  { id: 'n2', cx: 695, cy: 64, r: 10, glow: 18, opacity: 0.9 },
  { id: 'n3', cx: 885, cy: 48, r: 11, glow: 20, opacity: 0.92 },
  { id: 'n4', cx: 575, cy: 122, r: 10, glow: 18, opacity: 0.85 },
  { id: 'n5', cx: 675, cy: 168, r: 9, glow: 16, opacity: 0.78 },
  { id: 'n6', cx: 825, cy: 172, r: 8, glow: 15, opacity: 0.65 },
  { id: 'n7', cx: 738, cy: 196, r: 10, glow: 18, opacity: 0.85 },
  { id: 'n8', cx: 642, cy: 238, r: 12, glow: 22, opacity: 0.95 },
  { id: 'n9', cx: 582, cy: 198, r: 8, glow: 15, opacity: 0.58 },
  { id: 'n10', cx: 952, cy: 120, r: 6, glow: 12, opacity: 0.45 },
  { id: 'n11', cx: 482, cy: 52, r: 6, glow: 12, opacity: 0.45 },
  { id: 'n12', cx: 878, cy: 236, r: 6, glow: 12, opacity: 0.48 },
];

/** 배경 지식 그래프 노드 간 연결선 정의. */
const GRAPH_EDGES = [
  ['n1', 'n4'],
  ['n2', 'n3'],
  ['n2', 'n4'],
  ['n3', 'n10'],
  ['n4', 'n8'],
  ['n5', 'n6'],
  ['n5', 'n8'],
  ['n7', 'n8'],
  ['n7', 'n9'],
  ['n8', 'n12'],
  ['n1', 'n11'],
  ['n2', 'n7'],
];

/** 배경 분위기를 채우는 미세 파티클 좌표. */
const GRAPH_SPARKS = [
  { cx: 525, cy: 96, r: 1.4 },
  { cx: 642, cy: 92, r: 1.2 },
  { cx: 760, cy: 112, r: 1.5 },
  { cx: 848, cy: 92, r: 1.3 },
  { cx: 912, cy: 168, r: 1.5 },
  { cx: 540, cy: 228, r: 1.2 },
  { cx: 785, cy: 226, r: 1.4 },
  { cx: 942, cy: 36, r: 1.2 },
];

const NODE_MAP = Object.fromEntries(GRAPH_NODES.map((node) => [node.id, node]));

/**
 * 1페이지: 지식 그래프 탐색 슬라이드.
 * 기존 배너의 밝은 카드 톤 위에 잘 보이는 골드·프라이머리 계열 노드와 연결선을 자연스럽게 배치한다.
 */
function KnowledgeGraphSlide({ graphStats }) {
  return (
    <div className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-br from-muted/60 via-card to-card px-12 py-5 text-foreground sm:h-[304px] sm:px-14 sm:py-6">
      {/* 은은한 방사형 배경 포인트 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(217,119,6,0.12),transparent_52%),radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.08),transparent_48%)]"
      />

      {/* 기존 배너 배경에 자연스럽게 스며드는 지식 그래프 노드 비주얼 */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1000 270"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full select-none [mask-image:linear-gradient(to_right,transparent_12%,rgba(0,0,0,0.45)_40%,black_70%)]"
      >
        <defs>
          <radialGradient id="banner-node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#d97706" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </radialGradient>
        </defs>

        {GRAPH_EDGES.map(([fromId, toId]) => {
          const from = NODE_MAP[fromId];
          const to = NODE_MAP[toId];
          if (!from || !to) return null;
          return (
            <line
              key={`${fromId}-${toId}`}
              x1={from.cx}
              y1={from.cy}
              x2={to.cx}
              y2={to.cy}
              stroke="#b45309"
              strokeOpacity="0.32"
              strokeWidth="1.4"
            />
          );
        })}

        {GRAPH_SPARKS.map((spark, index) => (
          <circle key={index} cx={spark.cx} cy={spark.cy} r={spark.r} fill="#d97706" fillOpacity="0.45" />
        ))}

        {GRAPH_NODES.map((node) => (
          <g key={node.id} opacity={node.opacity}>
            <circle cx={node.cx} cy={node.cy} r={node.glow} fill="url(#banner-node-glow)" />
            <circle cx={node.cx} cy={node.cy} r={node.r} fill="#d97706" fillOpacity="0.82" />
            <circle cx={node.cx} cy={node.cy} r={node.r * 0.48} fill="#fef3c7" />
          </g>
        ))}
      </svg>

      <div className="relative z-10 flex max-w-xl flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/85 px-3 py-1 text-xs font-semibold text-muted-foreground backdrop-blur-xs">
            <Sparkles className="size-3.5 text-primary" />
            <span>AI 기술 블로그 · 지식 그래프</span>
            {graphStats && graphStats.nodeCount > 0 ? (
              <span className="border-l border-border pl-2 text-foreground">
                문서 {graphStats.nodeCount} · 연결 {graphStats.edgeCount}
              </span>
            ) : null}
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold leading-snug tracking-[-0.04em] text-foreground sm:text-2xl">
              글이 하나의 지식 그래프로 연결되는 개발 블로그
            </h1>
            <p className="max-w-lg text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
              코드 블록·Mermaid 다이어그램·수식으로 정리한 기술 아티클을 태그와 문맥 그래프 뷰로 탐색하세요.
            </p>
          </div>
        </div>

        <div className="pt-1">
          <Link
            href="/graph"
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:-translate-y-0.5 hover:opacity-95 sm:text-sm"
          >
            <Network className="size-4" />
            지식 그래프 탐색
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * 2페이지: 주요 개발 이슈·요즘 뜨는 기술 RSS 슬라이드.
 * RSS 조회 실패 시 폴백 큐레이션 목록을 표시한다.
 */
function DevTrendsSlide({ devTrends }) {
  const items = devTrends?.items?.length > 0 ? devTrends.items : FALLBACK_DEV_TRENDS;
  const sourceLabel = devTrends?.sourceLabel ?? '추천 기술 이슈';

  return (
    <div className="flex min-h-[280px] flex-col justify-between gap-3.5 rounded-2xl bg-gradient-to-br from-muted/60 via-card to-card px-12 py-5 sm:h-[304px] sm:px-14 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-semibold text-foreground">
            <Newspaper className="size-3.5 text-primary" />
            주요 개발 이슈 · 요즘 뜨는 기술
          </span>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
            {sourceLabel}
          </span>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-2.5 sm:grid-cols-2 sm:grid-rows-2">
        {items.slice(0, 4).map((item) => {
          const cardContent = (
            <div className="group/trend flex h-full items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/90 px-3.5 py-2.5 transition-all hover:border-primary/40 hover:bg-background hover:shadow-xs">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="line-clamp-1 text-xs font-bold text-foreground transition-colors group-hover/trend:text-primary sm:text-sm">
                  {item.title}
                </p>
                {item.summary ? <p className="line-clamp-1 text-[11px] text-muted-foreground">{item.summary}</p> : null}
                <p className="text-[11px] font-medium text-muted-foreground/80">
                  {item.source} · {item.publishedAt}
                </p>
              </div>
              <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover/trend:translate-x-0.5 group-hover/trend:-translate-y-0.5 group-hover/trend:text-primary" />
            </div>
          );

          return item.isExternal ? (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block h-full">
              {cardContent}
            </a>
          ) : (
            <Link key={item.id} href={item.url} className="block h-full">
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 메인 페이지 최상단 2페이지 자동 슬라이드 디스커버리 배너.
 * 1페이지: 지식 그래프 탐색, 2페이지: 개발 이슈/트렌드 RSS(폴백 포함).
 */
export default function BlogMainDiscoveryBanner({ graphStats = null, devTrends = null }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slideCount = BANNER_SLIDES.length;

  useEffect(() => {
    if (isPaused) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, slideCount]);

  function handlePrevSlide() {
    setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }

  function handleNextSlide() {
    setActiveIndex((prev) => (prev + 1) % slideCount);
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="메인 디스커버리 배너"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      className="relative mb-5 overflow-hidden rounded-lg border border-border/80 shadow-2xs"
    >
      {/* 좌측 끝 이전 슬라이드 화살표 */}
      <button
        type="button"
        onClick={handlePrevSlide}
        aria-label="이전 배너"
        className="absolute left-2.5 top-1/2 z-20 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-background/80 text-foreground shadow-xs backdrop-blur-xs transition-all hover:bg-background sm:left-3"
      >
        <ChevronLeft className="size-4" />
      </button>

      {/* 우측 끝 다음 슬라이드 화살표 */}
      <button
        type="button"
        onClick={handleNextSlide}
        aria-label="다음 배너"
        className="absolute right-2.5 top-1/2 z-20 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-background/80 text-foreground shadow-xs backdrop-blur-xs transition-all hover:bg-background sm:right-3"
      >
        <ChevronRight className="size-4" />
      </button>

      {/* 현재 활성 슬라이드 렌더링 */}
      <div className="transition-opacity duration-300">
        {activeIndex === 0 ? <KnowledgeGraphSlide graphStats={graphStats} /> : null}
        {activeIndex === 1 ? <DevTrendsSlide devTrends={devTrends} /> : null}
      </div>
    </section>
  );
}

import Link from 'next/link';
import { ArrowUpRight, Heart, MessageSquare, Network, Sparkles } from 'lucide-react';
import { postDetailHref } from '@/lib/url/handle';

/**
 * 메인 페이지 최상단 디스커버리 배너.
 * Atlex의 핵심 정체성(지식 그래프 탐색 · AI 기술 글쓰기)과 오늘의 스포트라이트 글을 함께 보여준다.
 */
export default function BlogMainDiscoveryBanner({ featuredPost, graphStats }) {
  const featuredHref =
    featuredPost?.authorUserId && featuredPost?.id ? postDetailHref(featuredPost.authorUserId, featuredPost.id) : null;

  return (
    <section className="mb-7 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted/60 via-card to-card p-5 shadow-xs sm:p-7">
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            <span>AI 기술 블로그 · 지식 그래프</span>
            {graphStats && graphStats.nodeCount > 0 ? (
              <span className="border-l border-border pl-2 text-foreground">
                문서 {graphStats.nodeCount} · 연결 {graphStats.edgeCount}
              </span>
            ) : null}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold leading-tight tracking-[-0.04em] text-foreground sm:text-[1.85rem]">
              글이 하나의 지식 그래프로 연결되는 개발 블로그
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              AI 코파일럿으로 코드 블록·Mermaid 다이어그램·수식을 빠르게 작성하고, 태그와 문맥으로 이어진 기술 아티클을
              그래프 뷰로 한눈에 탐색하세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <Link
              href="/graph"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:-translate-y-0.5 hover:opacity-95"
            >
              <Network className="size-4" />
              지식 그래프 탐색
            </Link>
            <Link
              href="/write"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted/70"
            >
              <Sparkles className="size-4 text-primary" />
              AI와 글쓰기
            </Link>
          </div>
        </div>

        {featuredPost ? (
          <div className="rounded-xl border border-border bg-background/90 p-4 shadow-xs transition-all hover:border-foreground/15 hover:shadow-md">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-primary uppercase">
                Spotlight
              </span>
              {featuredPost.eyebrow ? (
                <span className="text-xs font-medium text-muted-foreground">{featuredPost.eyebrow}</span>
              ) : null}
            </div>

            {featuredHref ? (
              <Link href={featuredHref} className="group block space-y-2">
                <h2 className="line-clamp-2 text-base font-bold leading-snug tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary sm:text-lg">
                  {featuredPost.title}
                </h2>
                {featuredPost.excerpt ? (
                  <p className="line-clamp-2 text-xs leading-5 text-muted-foreground sm:text-[0.82rem]">
                    {featuredPost.excerpt}
                  </p>
                ) : null}
                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">by {featuredPost.author}</span>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="size-3.5" />
                      {featuredPost.likes}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="size-3.5" />
                      {featuredPost.comments}
                    </span>
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="flex min-h-[156px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/60 p-6 text-center">
            <Network className="mb-2 size-8 text-primary/70" />
            <p className="text-sm font-semibold text-foreground">첫 기술 아티클을 작성해 보세요</p>
            <p className="mt-1 text-xs text-muted-foreground">작성한 글과 태그가 지식 그래프에 자동으로 연결됩니다.</p>
          </div>
        )}
      </div>
    </section>
  );
}

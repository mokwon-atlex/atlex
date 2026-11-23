import Link from 'next/link';
import { ArrowLeft, Hash } from 'lucide-react';
import Header from '@/components/common/layout/Header';
import { buttonVariants } from '@/components/common/ui/button';
import BlogMainInfinitePostGrid from '@/components/domain/blog-main/feature/BlogMainInfinitePostGrid';
import { loadMainPosts } from '@/lib/queries/blog-main';
import { cn } from '@/lib/utils';

/**
 * 특정 태그가 포함된 게시글 목록 페이지(`/tags/[tag]`).
 *
 * @param {{ params: Promise<{ tag: string }> }} props 동적 라우트 파라미터
 * @returns {Promise<React.ReactElement>} 태그별 게시글 목록 화면
 */
export default async function TagPostsPage({ params }) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const { posts, totalPages } = await loadMainPosts({ tag: decodedTag });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="mx-auto w-full max-w-content-wide px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex size-9 items-center justify-center rounded-md border border-border/80 bg-muted/50 text-foreground">
              <Hash className="size-4" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{decodedTag}</h1>
              <p className="text-xs text-muted-foreground">이 태그가 포함된 게시글 목록입니다.</p>
            </div>
          </div>

          <Link href="/tag_list" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}>
            <ArrowLeft className="size-3.5" />
            전체 태그 목록
          </Link>
        </div>

        <BlogMainInfinitePostGrid key={decodedTag} tag={decodedTag} initialPosts={posts} totalPages={totalPages} />
      </div>
    </main>
  );
}

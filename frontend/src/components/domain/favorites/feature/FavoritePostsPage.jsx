'use client';

// 로그인 사용자가 즐겨찾기한 게시글 목록 화면.
// 목록 응답(PostSummaryResponse)은 메인 피드와 같은 shape 이라 메인 카드 그리드를 그대로 쓴다.

import { useState } from 'react';
import Header from '@/components/common/layout/Header';
import RequireAuth from '@/components/common/auth/RequireAuth';
import { Button } from '@/components/common/ui/button';
import BlogMainPostGrid from '@/components/domain/blog-main/feature/BlogMainPostGrid';
import { useFavorites } from '@/hooks/queries/posts/usePostFavorite';
import { toBlogMainPost } from '@/lib/mappers/post';

const PAGE_SIZE = 20;

/**
 * 즐겨찾기 목록과 페이지 이동을 보여준다.
 */
function FavoritePostsContent() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, error, refetch } = useFavorites({ page, size: PAGE_SIZE });
  const posts = (data?.content ?? []).map(toBlogMainPost);
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">즐겨찾기</h1>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">즐겨찾기 목록을 불러오는 중입니다...</p>
      ) : isError ? (
        <div className="py-12 text-center">
          <p role="alert" className="mb-3 text-sm text-destructive">
            {error?.message || '즐겨찾기 목록을 불러오지 못했습니다.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      ) : (
        <BlogMainPostGrid posts={posts} emptyMessage="아직 즐겨찾기한 글이 없습니다." />
      )}

      {totalPages > 1 && (
        <nav aria-label="즐겨찾기 목록 페이지" className="flex items-center justify-center gap-3">
          <Button type="button" variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage(page - 1)}>
            이전
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            다음
          </Button>
        </nav>
      )}
    </div>
  );
}

/**
 * 즐겨찾기 목록 페이지. 미로그인 사용자는 로그인 화면으로 이동한다.
 * @returns {JSX.Element} 즐겨찾기 목록 페이지
 */
export function FavoritePostsPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="mx-auto w-full max-w-content-wide flex-1 px-5 pb-12 pt-7 sm:px-8 lg:px-10">
        <RequireAuth>
          <FavoritePostsContent />
        </RequireAuth>
      </div>
    </main>
  );
}

'use client';

import { useInfinitePosts } from '@/hooks/queries/posts/useInfinitePosts';
import BlogMainPostGrid from './BlogMainPostGrid';

export default function BlogMainInfinitePostGrid({ initialPosts, totalPages }) {
  const { posts, isLoading, sentinelRef } = useInfinitePosts({
    pageSize: 10,
    initialPosts,
    totalPages,
  });

  return (
    <>
      <BlogMainPostGrid posts={posts} emptyMessage="아직 표시할 게시글이 없습니다." />
      <div ref={sentinelRef} className="flex justify-center py-6">
        {isLoading && (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
        )}
      </div>
    </>
  );
}

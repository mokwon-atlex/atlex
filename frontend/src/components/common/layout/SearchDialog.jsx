'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText, Loader2, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Capsule } from '@/components/common/ui/capsule';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common/ui/dialog';
import { fetchPosts } from '@/lib/api/posts';
import { postDetailHref } from '@/lib/url/handle';

export default function SearchDialog({ onSearch }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [rawQuery, setRawQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(rawQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const searchQuery = useQuery({
    queryKey: ['post-search', debouncedQuery],
    queryFn: () => fetchPosts({ keyword: debouncedQuery, page: 0, size: 12 }),
    enabled: open && debouncedQuery.length > 0,
  });

  const results = searchQuery.data?.content ?? [];

  const handleOpen = () => {
    setOpen(true);
    onSearch?.();
  };

  const handleSelectPost = (post) => {
    if (!post?.authorUserId || !post?.id) {
      return;
    }
    setOpen(false);
    router.push(postDetailHref(post.authorUserId, post.id));
  };

  return (
    <>
      <Capsule
        variant="outline"
        size="lg"
        role="button"
        tabIndex={0}
        aria-label="검색"
        className="h-10 cursor-pointer gap-2 px-3 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground sm:px-4"
        onClick={handleOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleOpen();
          }
        }}
      >
        <Search className="size-4" strokeWidth={2.5} />
        <span className="hidden text-sm font-bold sm:inline">검색</span>
      </Capsule>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg" className="gap-0 overflow-hidden p-0" showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>게시글 검색</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={rawQuery}
              onChange={(event) => setRawQuery(event.target.value)}
              placeholder="제목, 본문, 태그, 작성자로 검색 (Ctrl+K)"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {rawQuery ? (
              <button
                type="button"
                aria-label="검색어 지우기"
                onClick={() => setRawQuery('')}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!debouncedQuery ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                검색어를 입력해 게시글을 찾아보세요.
              </div>
            ) : searchQuery.isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : searchQuery.isError ? (
              <div className="px-4 py-10 text-center text-sm text-destructive">
                검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                &lsquo;{debouncedQuery}&rsquo;에 대한 검색 결과가 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {results.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => handleSelectPost(post)}
                    className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{post.title}</p>
                        {post.categoryName ? (
                          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {post.categoryName}
                          </span>
                        ) : null}
                      </div>
                      {post.description ? (
                        <p className="line-clamp-1 text-xs text-muted-foreground">{post.description}</p>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{post.authorName || post.authorUserId}</span>
                        {Array.isArray(post.tags) && post.tags.length > 0 ? (
                          <span className="truncate text-primary/80">
                            {post.tags
                              .slice(0, 3)
                              .map((tag) => `#${tag}`)
                              .join(' ')}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

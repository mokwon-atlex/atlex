"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/common/ui/input";
import { cn } from "@/lib/utils";
import Header from "@/components/common/layout/Header";
import TagSortTabs from "../ui/TagSortTabs";
import TagGrid from "../ui/TagGrid";
import { SORT_OPTIONS, getCacheKey, fetchTags } from "@/app/tag_list/_lib/tags";

export default function TagListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sortParam = searchParams.get("sort");
  const currentSort = SORT_OPTIONS.some((o) => o.value === sortParam)
    ? sortParam
    : "trending";

  const [tags, setTags] = useState([]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const tagCacheRef = useRef(new Map());
  const requestIdRef = useRef(0);

  const pageRef = useRef(1);
  const hasMoreRef = useRef(false);
  const isLoadingRef = useRef(true);
  const isLoadingMoreRef = useRef(false);

  const loadMoreCallbackRef = useRef(null);
  const observerInstanceRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 300);
    return () => clearTimeout(handler);
  }, [keyword]);

  const normalizedKeyword = debouncedKeyword.trim().toLowerCase();

  const loadTags = useCallback(
    async ({ targetPage, reset = false }) => {
      const cacheKey = getCacheKey(currentSort, normalizedKeyword);

      if (reset) {
        const cached = tagCacheRef.current.get(cacheKey);
        if (cached) {
          pageRef.current = cached.page;
          hasMoreRef.current = cached.hasMore;
          isLoadingRef.current = false;
          isLoadingMoreRef.current = false;
          setTags(cached.items);
          setPage(cached.page);
          setTotalCount(cached.totalCount);
          setHasMore(cached.hasMore);
          setIsLoading(false);
          setIsLoadingMore(false);
          return;
        }

        pageRef.current = 1;
        hasMoreRef.current = false;
        isLoadingRef.current = true;
        isLoadingMoreRef.current = false;
        setTags([]);
        setPage(1);
        setTotalCount(0);
        setHasMore(false);
        setIsLoading(true);
        setIsLoadingMore(false);
      } else {
        if (isLoadingRef.current || isLoadingMoreRef.current || !hasMoreRef.current) return;
        isLoadingMoreRef.current = true;
        setIsLoadingMore(true);
      }

      const requestId = ++requestIdRef.current;

      try {
        const result = await fetchTags({
          sort: currentSort,
          keyword: normalizedKeyword,
          page: targetPage,
        });

        if (requestIdRef.current !== requestId) return;

        setTags((prevTags) => {
          const nextTags = reset ? result.items : [...prevTags, ...result.items];
          tagCacheRef.current.set(cacheKey, {
            items: nextTags,
            page: targetPage,
            totalCount: result.totalCount,
            hasMore: result.hasMore,
          });
          return nextTags;
        });

        pageRef.current = targetPage;
        hasMoreRef.current = result.hasMore;
        setPage(targetPage);
        setTotalCount(result.totalCount);
        setHasMore(result.hasMore);
      } finally {
        if (requestIdRef.current === requestId) {
          isLoadingRef.current = false;
          isLoadingMoreRef.current = false;
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [currentSort, normalizedKeyword]
  );

  loadMoreCallbackRef.current = () => {
    if (isLoadingRef.current || isLoadingMoreRef.current || !hasMoreRef.current) return;
    loadTags({ targetPage: pageRef.current + 1, reset: false });
  };

  useEffect(() => {
    loadTags({ targetPage: 1, reset: true });
  }, [loadTags]);

  const setObserverTarget = useCallback((node) => {
    if (observerInstanceRef.current) {
      observerInstanceRef.current.disconnect();
      observerInstanceRef.current = null;
    }

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMoreCallbackRef.current?.();
        }
      },
      { root: null, rootMargin: "160px", threshold: 0 }
    );

    observer.observe(node);
    observerInstanceRef.current = observer;
  }, []);

  const handleSortChange = (sortValue) => {
    if (!SORT_OPTIONS.some((o) => o.value === sortValue)) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sortValue);
    params.delete("page");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header logoHref="/" />
      <main className="mx-auto w-full max-w-content-wide px-5 pb-12 pt-7 sm:px-8 lg:px-10">
        <section className="mx-auto w-full max-w-[820px]">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.02em] text-foreground">
                태그 목록
              </h1>
              <TagSortTabs currentSort={currentSort} onSortChange={handleSortChange} />
            </div>

            <Input
              type="text"
              placeholder="태그 검색..."
              aria-label="태그 검색"
              variant="filled"
              size="lg"
              value={keyword}
              onChange={handleKeywordChange}
              className={cn(
                "w-full border-border bg-muted text-[14px] text-foreground",
                "placeholder:text-muted-foreground",
                "focus-visible:border-ring focus-visible:bg-muted",
                "sm:w-[250px]"
              )}
            />
          </div>

          {isLoading && (
            <p className="py-10 text-center text-[13px] text-muted-foreground">
              태그를 불러오는 중입니다.
            </p>
          )}

          {!isLoading && (
            <TagGrid
              tags={tags}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              normalizedKeyword={normalizedKeyword}
              keyword={keyword}
              totalCount={totalCount}
              observerRef={setObserverTarget}
            />
          )}
        </section>
      </main>
    </div>
  );
}

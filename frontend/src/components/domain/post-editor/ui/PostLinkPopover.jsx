'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { BookOpen, FileText, Loader2, Search } from 'lucide-react';

import { Button } from '@/components/common/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/common/ui/dialog';
import { fetchUserBlogPosts } from '@/lib/api/posts';
import { postDetailHref } from '@/lib/url/handle';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

/**
 * 에디터에서 [[ 입력 또는 툴바 클릭 시 내 작성 게시글을 검색하여
 * 본문에 링크로 삽입할 수 있는 팝오버/모달 컴포넌트입니다.
 *
 * @param {object} props
 * @param {import('@tiptap/react').Editor} props.editor - TipTap 에디터 인스턴스
 * @param {string} [props.userId] - 작성자 유저 ID (기본값: authStore의 로그인 유저 ID)
 */
export default function PostLinkPopover({ editor, userId: propUserId }) {
  const authUserId = useAuthStore((state) => state.user?.userId);
  const effectiveUserId = propUserId || authUserId;

  const [isOpen, setIsOpen] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [query, setQuery] = useState('');
  const [range, setRange] = useState(null);
  const [coords, setCoords] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const popoverRef = useRef(null);
  const inputRef = useRef(null);
  const listContainerRef = useRef(null);

  // 내 게시글 목록 무한 스크롤 조회 (50개 단위)
  const {
    data: postsPagesData,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['my-posts-for-link', effectiveUserId],
    queryFn: ({ pageParam = 0 }) => fetchUserBlogPosts({ userId: effectiveUserId, page: pageParam, size: 50 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const isLast = lastPage.last ?? lastPage.number + 1 >= lastPage.totalPages;
      if (isLast) return undefined;
      return (lastPage.number ?? 0) + 1;
    },
    enabled: Boolean(isOpen && effectiveUserId),
    staleTime: 1000 * 60 * 2, // 2분 캐시
  });

  const posts = useMemo(() => {
    return postsPagesData?.pages?.flatMap((p) => p?.content ?? []) ?? [];
  }, [postsPagesData]);

  // 검색어에 따른 게시글 필터링
  const filteredPosts = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return posts;
    return posts.filter((post) => {
      const titleMatch = post.title?.toLowerCase().includes(trimmed);
      const categoryMatch = post.categoryName?.toLowerCase().includes(trimmed);
      const tagMatch = post.tags?.some((t) => t?.toLowerCase().includes(trimmed));
      return Boolean(titleMatch || categoryMatch || tagMatch);
    });
  }, [posts, query]);

  // 검색 결과 수 변경 시 선택 인덱스 보정
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredPosts.length]);

  // 키보드 이동 시 선택 항목이 스크롤 영역 안에 보이도록 자동 스크롤
  useEffect(() => {
    if (listContainerRef.current) {
      const activeEl = listContainerRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // 모달 모드 열릴 때 인풋에 포커스
  useEffect(() => {
    if (isOpen && isModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isModal]);

  // 게시글 선택 및 링크 삽입
  const handleSelectPost = (post) => {
    if (!editor || !post) return;
    const authorId = post.authorUserId || effectiveUserId;
    const href = postDetailHref(authorId, post.id);

    editor.commands.insertPostLink({
      title: post.title,
      href,
      range,
    });
    handleClose();
    editor.commands.focus();
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsModal(false);
    setQuery('');
    setRange(null);
    setCoords(null);
    if (editor) {
      editor.commands.closePostLinkSearch();
    }
  };

  // 모달 검색창 키보드 조작 핸들러
  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredPosts.length ? (prev + 1) % filteredPosts.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredPosts.length ? (prev - 1 + filteredPosts.length) % filteredPosts.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredPosts[selectedIndex]) {
        handleSelectPost(filteredPosts[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  // 스크롤 시 하단 도달하면 다음 페이지 로드
  const handleListScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 40 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // TipTap 에디터 이벤트 구독 (인라인 모드 키보드 처리)
  useEffect(() => {
    if (!editor) return;

    const onTrigger = (payload) => {
      setIsOpen(true);
      setIsModal(Boolean(payload.isModal));
      setQuery(payload.query || '');
      setRange(payload.range || null);
      setCoords(payload.coords || null);
    };

    const onClose = () => {
      setIsOpen(false);
      setIsModal(false);
      setQuery('');
      setRange(null);
      setCoords(null);
    };

    const onKeyDown = ({ key, preventDefault }) => {
      if (!isOpen || isModal) return;

      if (key === 'ArrowDown') {
        preventDefault();
        setSelectedIndex((prev) => (filteredPosts.length ? (prev + 1) % filteredPosts.length : 0));
      } else if (key === 'ArrowUp') {
        preventDefault();
        setSelectedIndex((prev) =>
          filteredPosts.length ? (prev - 1 + filteredPosts.length) % filteredPosts.length : 0,
        );
      } else if (key === 'Enter') {
        preventDefault();
        if (filteredPosts[selectedIndex]) {
          handleSelectPost(filteredPosts[selectedIndex]);
        }
      } else if (key === 'Escape') {
        preventDefault();
        handleClose();
      }
    };

    editor.on('postLinkTrigger', onTrigger);
    editor.on('postLinkClose', onClose);
    editor.on('postLinkKeyDown', onKeyDown);

    return () => {
      editor.off('postLinkTrigger', onTrigger);
      editor.off('postLinkClose', onClose);
      editor.off('postLinkKeyDown', onKeyDown);
    };
  }, [editor, isOpen, isModal, filteredPosts, selectedIndex, effectiveUserId, range]);

  // 외부 클릭 시 닫기 (인라인 플로팅 모드 전용)
  useEffect(() => {
    if (!isOpen || isModal) return;

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isModal]);

  if (!isOpen) return null;

  // 게시글 목록 렌더링
  const renderPostList = () => {
    if (!effectiveUserId) {
      return (
        <div className="py-6 text-center text-xs text-muted-foreground">로그인 후 내 게시글을 검색할 수 있습니다.</div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-6 text-xs text-muted-foreground gap-2">
          <Loader2 className="size-3.5 animate-spin" />
          <span>게시글을 불러오는 중...</span>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="py-6 text-center text-xs space-y-2">
          <p className="text-destructive">게시글 목록을 불러오지 못했습니다.</p>
          <Button type="button" variant="outline" size="xs" onClick={() => refetch()} className="text-xs">
            다시 시도
          </Button>
        </div>
      );
    }

    if (posts.length === 0) {
      return <div className="py-6 text-center text-xs text-muted-foreground">작성된 게시글이 없습니다.</div>;
    }

    if (filteredPosts.length === 0) {
      return (
        <div className="py-6 text-center text-xs text-muted-foreground">&apos;{query}&apos; 검색 결과가 없습니다.</div>
      );
    }

    return (
      <div ref={listContainerRef} onScroll={handleListScroll} className="max-h-60 overflow-y-auto space-y-1 p-1">
        {filteredPosts.map((post, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={post.id}
              type="button"
              data-index={index}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => handleSelectPost(post)}
              className={cn(
                'w-full flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors',
                isSelected ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-muted/60 text-foreground',
              )}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{post.title}</span>
              </div>
              {post.categoryName ? (
                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                  {post.categoryName}
                </span>
              ) : null}
            </button>
          );
        })}

        {hasNextPage && (
          <div className="p-1 text-center">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
              className="text-[11px] text-muted-foreground w-full"
            >
              {isFetchingNextPage ? (
                <span className="flex items-center justify-center gap-1">
                  <Loader2 className="size-3 animate-spin" /> 불러오는 중...
                </span>
              ) : (
                '이전 글 더 불러오기'
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  // 모달 모드 (툴바 클릭 시) - 접근성 높은 Dialog 컴포넌트 사용
  if (isModal) {
    return (
      <Dialog
        open={isOpen && isModal}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <DialogContent size="md" className="p-4 space-y-3" showCloseButton>
          <DialogHeader className="gap-1 border-b border-border/60 pb-2.5">
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="size-4 text-primary" />내 게시글 링크 삽입
            </DialogTitle>
            <DialogDescription className="sr-only">
              작성한 게시글을 검색하여 본문에 링크로 삽입합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              aria-label="게시글 제목 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="게시글 제목 검색..."
              className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {renderPostList()}

          <div className="flex items-center justify-between border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
            <span>방향키(↑↓)로 이동하고 Enter로 선택</span>
            <span>Esc로 닫기</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 인라인 플로팅 모드 ([[ 입력 시])
  const topPos = coords ? Math.min(window.innerHeight - 300, coords.bottom + 8) : 100;
  const leftPos = coords ? Math.max(16, Math.min(window.innerWidth - 340, coords.left)) : 100;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-popover text-popover-foreground shadow-xl p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: `${topPos}px`,
        left: `${leftPos}px`,
      }}
    >
      <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-muted-foreground border-b border-border/40">
        <span className="flex items-center gap-1.5">
          <BookOpen className="size-3 text-primary" />내 게시글 링크
        </span>
        {query ? <span className="font-normal text-[10px] truncate max-w-[120px]">&apos;{query}&apos;</span> : null}
      </div>

      {renderPostList()}

      <div className="px-2 pt-1 border-t border-border/40 text-[9px] text-muted-foreground flex justify-between">
        <span>↑↓ 이동 · Enter 선택</span>
        <span>Esc 닫기</span>
      </div>
    </div>
  );
}

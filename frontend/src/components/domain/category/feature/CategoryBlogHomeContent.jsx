'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { buttonVariants } from '@/components/common/ui/button';
import CategoryBlogHomeSidebarCategoryDialog from '@/components/domain/category/layout/CategoryBlogHomeSidebarCategoryDialog';
import BlogHomeFeed from '@/components/domain/blog-home/feature/BlogHomeFeed';
import BlogHomeSidebar from '@/components/domain/blog-home/feature/BlogHomeSidebar';
import BlogHomeBodyLayout from '@/components/domain/blog-home/layout/BlogHomeBodyLayout';
import { ALL_CATEGORY_ID, findCategoryById } from '@/lib/category/category-picker';
import { addPostLike, fetchUserBlogPosts, removePostLike } from '@/lib/api/posts';
import { toBlogHomeFeedPost } from '@/lib/mappers/post';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const ALL_TAG_ID = 'all';

function getInitialSelectedTagId(tags) {
  return tags.find((tag) => tag.active)?.id ?? tags[0]?.id ?? ALL_TAG_ID;
}

function createPagination(currentPage, totalPages) {
  const safeTotalPages = Math.max(Number(totalPages) || 1, 1);

  return [
    { id: 'prev', label: '<', kind: 'control' },
    ...Array.from({ length: safeTotalPages }, (_, index) => {
      const page = index + 1;

      return {
        id: `page-${page}`,
        label: String(page),
        current: page === currentPage,
      };
    }),
    { id: 'next', label: '>', kind: 'control' },
  ];
}

function isPostWrittenByUser(post, userId) {
  const postAuthorUserId = post?.authorUserId ?? post?.userId ?? post?.author?.userId ?? post?.user?.userId;

  if (postAuthorUserId == null || userId == null) {
    return false;
  }

  return String(postAuthorUserId).toLowerCase() === String(userId).toLowerCase();
}

/** 카테고리 필터와 프로필별 그래프 바로가기를 포함한 블로그 홈 본문이다. */
export default function CategoryBlogHomeContent({ categories = [], feed, profile, tags }) {
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const currentUserId = useAuthStore((state) => state.user?.userId);
  const [mounted, setMounted] = useState(false);
  const [pageFeed, setPageFeed] = useState(feed);
  const [isPageLoading, setIsPageLoading] = useState(false);
  // 현재 목록의 liked 가 누구 기준으로 조회된 값인지 기록한다.
  // SSR 요청에는 토큰이 붙지 않으므로 초기 목록은 비로그인(null) 기준이다.
  const [likeStateUserId, setLikeStateUserId] = useState(null);
  // 좋아요 요청이 진행 중인 게시글 id. 같은 글의 중복 요청을 막는다.
  const [pendingLikePostIds, setPendingLikePostIds] = useState(() => new Set());
  const latestRequestIdRef = useRef(0);
  // 요청 완료 시점에 계정이 바뀌었는지 비교하기 위해 최신 사용자를 ref 로도 유지한다.
  const currentUserIdRef = useRef(currentUserId ?? null);
  currentUserIdRef.current = currentUserId ?? null;
  // 로그인 사용자 기준 목록을 확보하기 전에는 liked 를 신뢰할 수 없어 표시와 토글을 막는다.
  // mounted 조건은 서버와 첫 클라이언트 렌더의 disabled 속성을 맞추기 위함이다.
  const isLikeStateReady = mounted && likeStateUserId === (currentUserId ?? null);
  const quickActions = profile.quickActions ?? [];
  const [selectedTagId, setSelectedTagId] = useState(() => getInitialSelectedTagId(tags));
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORY_ID);
  const isOwnerBlog = mounted && currentUserId === profile.userId;
  const resolvedQuickActions = isOwnerBlog ? quickActions : quickActions.filter(({ id }) => id !== 'option');
  const graphParams = new URLSearchParams();

  if (profile?.userId) {
    graphParams.set('userId', profile.userId);
  }
  if (selectedCategoryId !== ALL_CATEGORY_ID) {
    graphParams.set('categoryId', String(selectedCategoryId));
  }

  const graphHref = graphParams.size > 0 ? `/graph?${graphParams.toString()}` : '/graph';

  const selectedTag = tags.find((tag) => tag.id === selectedTagId);
  const isAllTag = !selectedTag || selectedTag.id === ALL_TAG_ID;
  const currentTagLabel = isAllTag ? undefined : selectedTag?.label;

  const resolvedTags = tags.map((tag) => ({
    ...tag,
    active: tag.id === selectedTagId,
  }));

  const resolvedFeed = useMemo(() => {
    const selectedCategory = findCategoryById(categories, selectedCategoryId);
    const selectedCategoryLabel = selectedCategory?.label ?? selectedCategory?.name ?? pageFeed.title;
    const isAllCategory = selectedCategoryId === ALL_CATEGORY_ID;

    const displayTitle = !isAllTag ? `#${selectedTag.label}` : isAllCategory ? pageFeed.title : selectedCategoryLabel;

    // 태그와 카테고리를 모두 서버에서 필터링하므로 응답의 목록과 총 개수를 그대로 사용한다.
    // 클라이언트에서 다시 거르면 페이지 단위로만 걸러져 totalCount, totalPages 가 실제와 어긋난다.
    return {
      ...pageFeed,
      posts: pageFeed.posts?.map((post) => ({
        ...post,
        // 다른 사용자 기준 상태가 남아 있으면 보정 조회가 끝날 때까지 채워진 하트를 숨긴다.
        isLiked: isLikeStateReady && post.isLiked,
        isLikeDisabled: !isLikeStateReady || pendingLikePostIds.has(post.id),
        onLikeToggle: () => handleLikeToggle(post),
      })),
      isLoading: isPageLoading,
      onPageChange: handlePageChange,
      title: displayTitle,
    };
  }, [
    pageFeed,
    categories,
    selectedCategoryId,
    isAllTag,
    selectedTag,
    isPageLoading,
    isLikeStateReady,
    pendingLikePostIds,
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPageFeed(feed);
    // 새로 받은 SSR 목록은 비로그인 기준이므로 보정 조회가 끝날 때까지 liked 를 신뢰하지 않는다.
    setLikeStateUserId(null);
  }, [feed]);

  // 태그나 카테고리 선택이 바뀌면 서버에서 1페이지부터 다시 조회해 페이지네이션을 초기화한다.
  // 마운트 직후와 계정이 바뀔 때도 다시 조회해 목록의 liked 를 현재 사용자 기준으로 맞춘다.
  useEffect(() => {
    if (!mounted || !profile?.userId) return;
    const selected = tags.find((t) => t.id === selectedTagId);
    const isAll = !selected || selected.id === ALL_TAG_ID;
    const targetTag = isAll ? undefined : selected?.label;
    handlePageChange(1, targetTag, selectedCategoryId);
  }, [selectedTagId, selectedCategoryId, mounted, profile?.userId, currentUserId]);

  const quickActionLinkClassName = cn(
    buttonVariants({ size: 'icon-lg', variant: 'outline' }),
    'rounded-full border-border bg-muted/70 text-foreground shadow-none transition-colors hover:bg-muted hover:text-foreground',
  );

  function handleCategorySelect(categoryId) {
    setSelectedCategoryId(categoryId);
  }

  /**
   * 선택한 페이지의 게시글 목록을 서버에서 조회해 피드 상태를 갱신한다.
   *
   * @param {number} page 1부터 시작하는 페이지 번호
   * @param {string} [tag] 필터링할 태그 이름. 전체 태그면 undefined
   * @param {string} [categoryId] 필터링할 카테고리 id. 전체 카테고리면 ALL_CATEGORY_ID
   */
  async function handlePageChange(page, tag = currentTagLabel, categoryId = selectedCategoryId) {
    if (!profile?.userId) return;

    const pageSize = pageFeed.pageSize ?? 10;
    // 전체 카테고리는 조건 자체를 보내지 않아야 서버가 필터를 건너뛴다.
    const targetCategoryId = categoryId === ALL_CATEGORY_ID ? undefined : categoryId;

    // 필터를 빠르게 바꾸면 이전 요청이 뒤늦게 끝나 최신 선택의 결과를 덮어쓴다.
    // 요청마다 순번을 부여해 마지막 요청의 응답만 상태에 반영한다.
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;
    const requestUserId = currentUserIdRef.current;

    setIsPageLoading(true);

    try {
      const postsPage = await fetchUserBlogPosts({
        page: page - 1,
        size: pageSize,
        userId: profile.userId,
        tag: tag || undefined,
        categoryId: targetCategoryId,
      });

      if (requestId !== latestRequestIdRef.current) return;

      const postContent = Array.isArray(postsPage?.content) ? postsPage.content : [];
      const ownerPostContent = postContent.filter((post) => isPostWrittenByUser(post, profile.userId));
      const totalCount =
        ownerPostContent.length === postContent.length
          ? (postsPage?.totalElements ?? ownerPostContent.length)
          : ownerPostContent.length;
      const totalPages =
        ownerPostContent.length === postContent.length
          ? (postsPage?.totalPages ?? Math.max(Math.ceil(totalCount / pageSize), 1))
          : Math.max(Math.ceil(totalCount / pageSize), 1);

      setPageFeed((previousFeed) => ({
        ...previousFeed,
        page,
        pageSize,
        pagination: createPagination(page, totalPages),
        posts: ownerPostContent.map(toBlogHomeFeedPost),
        totalCount,
        totalPages,
      }));
      setLikeStateUserId(requestUserId);
    } catch (error) {
      if (requestId !== latestRequestIdRef.current) return;

      console.error('Failed to fetch user blog posts:', error);
    } finally {
      // 뒤처진 요청이 로딩 상태를 먼저 해제하면 진행 중인 최신 요청이 로딩으로 보이지 않는다.
      if (requestId === latestRequestIdRef.current) {
        setIsPageLoading(false);
      }
    }
  }

  /**
   * 피드 게시글의 좋아요를 토글한다.
   * 응답을 기다리지 않고 목록을 먼저 갱신하고, 실패하면 직전 값으로 되돌린다.
   *
   * @param {{ id: number, isLiked: boolean, likes: number }} post 토글할 피드 게시글
   */
  async function handleLikeToggle(post) {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    if (!isLikeStateReady || pendingLikePostIds.has(post.id)) return;

    const requestUserId = currentUserIdRef.current;
    const { id: postId, isLiked: previousLiked, likes: previousLikes } = post;

    setPendingLikePostIds((previous) => new Set(previous).add(postId));
    updateFeedPost(postId, {
      isLiked: !previousLiked,
      likes: Math.max(0, previousLikes + (previousLiked ? -1 : 1)),
    });

    try {
      const response = await (previousLiked ? removePostLike(postId) : addPostLike(postId));

      // 요청 중 계정이 바뀌면 이전 사용자의 결과를 목록에 쓰지 않는다. 재조회 결과가 기준이다.
      if (requestUserId !== currentUserIdRef.current) return;

      updateFeedPost(postId, {
        isLiked: Boolean(response?.liked),
        likes: response?.likes ?? previousLikes,
      });
    } catch (error) {
      if (requestUserId === currentUserIdRef.current) {
        updateFeedPost(postId, { isLiked: previousLiked, likes: previousLikes });
      }
      console.error('Failed to toggle post like:', error);
    } finally {
      setPendingLikePostIds((previous) => {
        const next = new Set(previous);
        next.delete(postId);
        return next;
      });
    }
  }

  /**
   * 현재 피드 목록에서 한 게시글의 값만 바꾼다. 목록이 바뀌어 게시글이 없으면 아무것도 하지 않는다.
   *
   * @param {number} postId 대상 게시글 id
   * @param {object} changes 덮어쓸 필드
   */
  function updateFeedPost(postId, changes) {
    setPageFeed((previousFeed) => ({
      ...previousFeed,
      posts: previousFeed.posts.map((item) => (item.id === postId ? { ...item, ...changes } : item)),
    }));
  }

  const quickActionOverrides = {
    category: ({ id, label }) => (
      <CategoryBlogHomeSidebarCategoryDialog
        key={id}
        actionId={id}
        ariaLabel={label}
        categories={categories}
        label={label}
        onCategorySelect={handleCategorySelect}
        posts={feed.posts}
        selectedCategoryId={selectedCategoryId}
      />
    ),
    graph: ({ icon: Icon, id, label }) => (
      <Link key={id} href={graphHref} aria-label={label} className={quickActionLinkClassName}>
        {Icon ? <Icon className="size-4" /> : null}
      </Link>
    ),
    option: ({ icon: Icon, id, label }) => (
      <Link key={id} href="/blog_option" aria-label={label} className={quickActionLinkClassName}>
        {Icon ? <Icon className="size-4" /> : null}
      </Link>
    ),
  };

  return (
    <BlogHomeBodyLayout
      sidebar={
        <BlogHomeSidebar
          onTagSelect={setSelectedTagId}
          profile={{
            ...profile,
            quickActions: resolvedQuickActions,
          }}
          quickActionOverrides={quickActionOverrides}
          tags={resolvedTags}
        />
      }
    >
      <BlogHomeFeed feed={resolvedFeed} />
    </BlogHomeBodyLayout>
  );
}

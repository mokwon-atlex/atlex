'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { buttonVariants } from '@/components/common/ui/button';
import CategoryBlogHomeSidebarCategoryDialog from '@/components/domain/category/layout/CategoryBlogHomeSidebarCategoryDialog';
import BlogHomeFeed from '@/components/domain/blog-home/feature/BlogHomeFeed';
import BlogHomeSidebar from '@/components/domain/blog-home/feature/BlogHomeSidebar';
import BlogHomeBodyLayout from '@/components/domain/blog-home/layout/BlogHomeBodyLayout';
import { ALL_CATEGORY_ID, findCategoryById } from '@/lib/category/category-picker';
import { fetchUserBlogPosts } from '@/lib/api/posts';
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
  const currentUserId = useAuthStore((state) => state.user?.userId);
  const [mounted, setMounted] = useState(false);
  const [pageFeed, setPageFeed] = useState(feed);
  const [isPageLoading, setIsPageLoading] = useState(false);
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
      isLoading: isPageLoading,
      onPageChange: handlePageChange,
      title: displayTitle,
    };
  }, [pageFeed, categories, selectedCategoryId, isAllTag, selectedTag, isPageLoading]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPageFeed(feed);
  }, [feed]);

  // 태그나 카테고리 선택이 바뀌면 서버에서 1페이지부터 다시 조회해 페이지네이션을 초기화한다.
  useEffect(() => {
    if (!mounted || !profile?.userId) return;
    const selected = tags.find((t) => t.id === selectedTagId);
    const isAll = !selected || selected.id === ALL_TAG_ID;
    const targetTag = isAll ? undefined : selected?.label;
    handlePageChange(1, targetTag, selectedCategoryId);
  }, [selectedTagId, selectedCategoryId, mounted, profile?.userId]);

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

    setIsPageLoading(true);

    try {
      const postsPage = await fetchUserBlogPosts({
        page: page - 1,
        size: pageSize,
        userId: profile.userId,
        tag: tag || undefined,
        categoryId: targetCategoryId,
      });
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
    } catch (error) {
      console.error('Failed to fetch user blog posts:', error);
    } finally {
      setIsPageLoading(false);
    }
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

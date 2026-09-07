"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { buttonVariants } from "@/components/common/ui/button";
import CategoryBlogHomeSidebarCategoryDialog from "@/components/domain/category/layout/CategoryBlogHomeSidebarCategoryDialog";
import BlogHomeFeed from "@/components/domain/blog-home/feature/BlogHomeFeed";
import BlogHomeSidebar from "@/components/domain/blog-home/feature/BlogHomeSidebar";
import BlogHomeBodyLayout from "@/components/domain/blog-home/layout/BlogHomeBodyLayout";
import {
  ALL_CATEGORY_ID,
  findCategoryById,
  filterPostsByCategoryId,
} from "@/lib/category/category-picker";
import { fetchUserBlogPosts } from "@/lib/api/posts";
import { toBlogHomeFeedPost } from "@/lib/mappers/post";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const ALL_TAG_ID = "all";

function getInitialSelectedTagId(tags) {
  return tags.find((tag) => tag.active)?.id ?? tags[0]?.id ?? ALL_TAG_ID;
}

function createPagination(currentPage, totalPages) {
  const safeTotalPages = Math.max(Number(totalPages) || 1, 1);

  return [
    { id: "prev", label: "<", kind: "control" },
    ...Array.from({ length: safeTotalPages }, (_, index) => {
      const page = index + 1;

      return {
        id: `page-${page}`,
        label: String(page),
        current: page === currentPage,
      };
    }),
    { id: "next", label: ">", kind: "control" },
  ];
}

function isPostWrittenByUser(post, userId) {
  const postAuthorUserId =
    post?.authorUserId ??
    post?.userId ??
    post?.author?.userId ??
    post?.user?.userId;

  if (postAuthorUserId == null || userId == null) {
    return false;
  }

  return String(postAuthorUserId).toLowerCase() === String(userId).toLowerCase();
}

export default function CategoryBlogHomeContent({
  categories = [],
  feed,
  profile,
  tags,
}) {
  const currentUserId = useAuthStore((state) => state.user?.userId);
  const [mounted, setMounted] = useState(false);
  const [pageFeed, setPageFeed] = useState(feed);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const quickActions = profile.quickActions ?? [];
  const [selectedTagId, setSelectedTagId] = useState(() =>
    getInitialSelectedTagId(tags)
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORY_ID);
  const isOwnerBlog = mounted && currentUserId === profile.userId;
  const resolvedQuickActions = isOwnerBlog
    ? quickActions
    : quickActions.filter(({ id }) => id !== "option");

  const resolvedTags = tags.map((tag) => ({
    ...tag,
    active: tag.id === selectedTagId,
  }));
  const resolvedFeed = useMemo(() => {
    const filteredPosts = filterPostsByCategoryId(
      pageFeed.posts,
      categories,
      selectedCategoryId
    );
    const selectedCategory = findCategoryById(categories, selectedCategoryId);
    const selectedCategoryLabel =
      selectedCategory?.label ?? selectedCategory?.name ?? pageFeed.title;
    const isAllCategory = selectedCategoryId === ALL_CATEGORY_ID;

    return {
      ...pageFeed,
      isLoading: isPageLoading,
      onPageChange: isAllCategory ? handlePageChange : undefined,
      pagination: isAllCategory ? pageFeed.pagination : [],
      posts: filteredPosts,
      title: isAllCategory ? pageFeed.title : selectedCategoryLabel,
      totalCount: isAllCategory ? pageFeed.totalCount : filteredPosts.length,
    };
  }, [pageFeed, categories, selectedCategoryId, isPageLoading]);


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPageFeed(feed);
  }, [feed]);

  const quickActionLinkClassName = cn(
    buttonVariants({ size: "icon-lg", variant: "outline" }),
    "rounded-full border-border bg-muted/70 text-foreground shadow-none transition-colors hover:bg-muted hover:text-foreground"
  );

  function handleCategorySelect(categoryId) {
    setSelectedCategoryId(categoryId);
  }

  async function handlePageChange(page) {
    const pageSize = pageFeed.pageSize ?? 10;

    setIsPageLoading(true);

    try {
      const postsPage = await fetchUserBlogPosts({
        page: page - 1,
        size: pageSize,
        userId: profile.userId,
      });
      const postContent = Array.isArray(postsPage?.content) ? postsPage.content : [];
      const ownerPostContent = postContent.filter((post) =>
        isPostWrittenByUser(post, profile.userId)
      );
      const totalCount =
        ownerPostContent.length === postContent.length
          ? postsPage?.totalElements ?? ownerPostContent.length
          : ownerPostContent.length;
      const totalPages =
        ownerPostContent.length === postContent.length
          ? postsPage?.totalPages ?? Math.max(Math.ceil(totalCount / pageSize), 1)
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
      console.error("Failed to fetch user blog posts:", error);
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
      <Link
        key={id}
        href="/graph"
        aria-label={label}
        className={quickActionLinkClassName}
      >
        {Icon ? <Icon className="size-4" /> : null}
      </Link>
    ),
    option: ({ icon: Icon, id, label }) => (
      <Link
        key={id}
        href="/blog_option"
        aria-label={label}
        className={quickActionLinkClassName}
      >
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

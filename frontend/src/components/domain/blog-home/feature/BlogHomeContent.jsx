'use client';

import Link from 'next/link';
import { useState } from 'react';

import { buttonVariants } from '@/components/common/ui/button';
import BlogHomeFeed from '@/components/domain/blog-home/feature/BlogHomeFeed';
import BlogHomeSidebar from '@/components/domain/blog-home/feature/BlogHomeSidebar';
import BlogHomeBodyLayout from '@/components/domain/blog-home/layout/BlogHomeBodyLayout';
import { cn } from '@/lib/utils';

const ALL_TAG_ID = 'all';

function getInitialSelectedTagId(tags) {
  return tags.find((tag) => tag.active)?.id ?? tags[0]?.id ?? ALL_TAG_ID;
}

/** 블로그 홈의 피드와 프로필별 그래프 바로가기를 렌더링한다. */
export default function BlogHomeContent({ feed, profile, tags }) {
  const [selectedTagId, setSelectedTagId] = useState(() => getInitialSelectedTagId(tags));
  const graphHref = profile?.userId ? `/graph?userId=${encodeURIComponent(profile.userId)}` : '/graph';

  const resolvedTags = tags.map((tag) => ({
    ...tag,
    active: tag.id === selectedTagId,
  }));

  const quickActionOverrides = {
    graph: ({ icon: Icon, id, label }) => (
      <Link
        key={id}
        href={graphHref}
        aria-label={label}
        className={cn(
          buttonVariants({ size: 'icon-lg', variant: 'outline' }),
          'rounded-full border-border bg-muted/70 text-foreground shadow-none transition-colors hover:bg-muted hover:text-foreground',
        )}
      >
        {Icon ? <Icon className="size-4" /> : null}
      </Link>
    ),
  };

  return (
    <BlogHomeBodyLayout
      sidebar={
        <BlogHomeSidebar
          quickActionOverrides={quickActionOverrides}
          profile={profile}
          tags={resolvedTags}
          onTagSelect={setSelectedTagId}
        />
      }
    >
      <BlogHomeFeed feed={feed} />
    </BlogHomeBodyLayout>
  );
}

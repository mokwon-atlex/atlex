import BlogMainSection from '@/components/domain/blog-main/feature/BlogMainSection';
import Header from '@/components/common/layout/Header';
import { blogMainFilters } from '@/data/blog-main/blog-main-posts';
import { loadMainPosts } from '@/lib/queries/blog-main';

export const metadata = {
  title: 'User Blog Main',
  description: 'User blog main page'
};

export default async function MainPage({ searchParams }) {
  // Next.js App Router 환경에서 searchParams 값을 안전하게 읽기 위해 await 처리합니다.
  const resolvedSearchParams = await searchParams;

  // URL query parameter 에서 현재 보기 필터를 읽습니다.
  const filterId = resolvedSearchParams?.filter ?? blogMainFilters[0].id;

  const activeFilter =
    blogMainFilters.find(filter => filter.id === filterId) ?? blogMainFilters[0];

  const { posts, totalPages } = await loadMainPosts({
    filterId: activeFilter.id,
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="mx-auto w-full max-w-content-wide px-5 pb-12 pt-7 sm:px-8 lg:px-10">
        <BlogMainSection
          filters={blogMainFilters}
          activeFilterId={activeFilter.id}
          initialPosts={posts}
          totalPages={totalPages}
        />
      </div>
    </main>
  );
}
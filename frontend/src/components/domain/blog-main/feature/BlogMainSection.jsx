'use client';

import { useRouter } from 'next/navigation';

import BlogMainToolbar from './BlogMainToolbar';
import BlogMainInfinitePostGrid from './BlogMainInfinitePostGrid';

export default function BlogMainSection({ filters, activeFilterId, initialPosts, totalPages }) {
  const router = useRouter();

  function handleChangeFilter(nextFilterId) {
    const params = new URLSearchParams();

    // 기본 보기 필터는 URL을 짧게 유지합니다.
    if (nextFilterId !== 'trending') {
      params.set('filter', nextFilterId);
    }

    const queryString = params.toString();

    // URL에 보기 상태를 남겨 상세 페이지 이동 후 뒤로가기 시에도 동일한 탭을 유지합니다.
    router.push(queryString ? `/?${queryString}` : '/');
  }

  return (
    <>
      <BlogMainToolbar activeFilterId={activeFilterId} filters={filters} onChangeFilter={handleChangeFilter} />

      <BlogMainInfinitePostGrid key={activeFilterId} initialPosts={initialPosts} totalPages={totalPages} />
    </>
  );
}

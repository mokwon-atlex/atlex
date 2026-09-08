// 메인 피드 무한스크롤 훅.
// TanStack Query 의 useInfiniteQuery 로 페이지 데이터를 관리하고,
// IntersectionObserver 로 "목록 맨 아래 도달 → 자동 다음 페이지 로드"를 연결한다.
//
// ── 사용법 (컴포넌트 입장) ──
// const { posts, isLoading, hasMore, sentinelRef } = useInfinitePosts({ initialPosts, totalPages });
// 1) posts 를 렌더링한다.
// 2) 목록 맨 아래에 <div ref={sentinelRef} /> 를 하나 놓는다.
// 3) 사용자가 스크롤해서 sentinelRef 요소가 화면에 보이면 자동으로 다음 페이지를 불러온다.
//
// ── 파라미터 ──
//   pageSize:     한 번에 가져올 글 수 (기본 10)
//   authorUserId: 특정 유저의 글만 볼 때 (선택). 없으면 전체 글.
//   initialPosts: SSR(서버)에서 미리 가져온 첫 페이지 데이터. 있으면 클라이언트가 재요청하지 않아 깜빡임이 없다.
//   totalPages:   SSR 에서 받은 총 페이지 수. 마지막 페이지 여부를 판단하는 기준.

'use client';

import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/lib/api/posts';
import { toBlogMainPost } from '@/lib/mappers/post';

export function useInfinitePosts({ pageSize = 10, authorUserId, initialPosts, totalPages } = {}) {
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    // queryKey: 이 배열이 같으면 같은 캐시를 바라본다. pageSize/authorUserId 가 바뀌면 새 요청을 보낸다.
    queryKey: ['posts', { authorUserId, pageSize }],

    // queryFn: 다음 페이지를 실제로 가져오는 함수. pageParam 은 TanStack 이 주입해주는 페이지 번호.
    queryFn: async ({ pageParam }) => {
      const res = await fetchPosts({
        authorUserId,
        page: pageParam,
        size: pageSize,
      });
      // API 응답을 컴포넌트가 바로 쓸 수 있는 shape 으로 변환해 캐시에 저장한다.
      // SSR 에서 내려온 initialData 와 형태를 맞춰야 hydration 이 자연스럽다.
      return {
        posts: res.content.map(toBlogMainPost),
        page: res.number, // 현재 페이지 번호 (0부터 시작)
        totalPages: res.totalPages,
      };
    },

    initialPageParam: 0, // 첫 요청은 0번 페이지부터.

    // 다음 페이지 번호를 계산한다. 마지막 페이지라면 undefined 를 반환해 hasNextPage 를 false 로 만든다.
    getNextPageParam: (lastPage) => (lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined),

    // SSR 에서 받은 첫 페이지를 캐시에 바로 주입한다.
    // initialPosts 가 없으면 undefined 로 두어 클라이언트가 직접 첫 페이지를 요청하게 한다.
    initialData:
      initialPosts === undefined
        ? undefined
        : {
            pages: [{ posts: initialPosts, page: 0, totalPages: totalPages ?? 0 }],
            pageParams: [0],
          },
  });

  // sentinel: 목록 맨 아래에 놓을 빈 요소. 이 요소가 화면에 들어오면 다음 페이지를 불러온다.
  const sentinelRef = useRef(null);

  // 모든 페이지의 posts 를 하나의 배열로 합친다. data 가 없으면 빈 배열.
  // 백엔드 페이징 경계에서 같은 글이 두 페이지에 걸쳐 중복될 수 있어,
  // id 기준으로 한 번 걸러내 React key 중복(렌더링 중복)을 방지한다.
  const seenIds = new Set();
  const posts =
    data?.pages
      .flatMap((p) => p.posts)
      .filter((post) => {
        if (seenIds.has(post.id)) return false;
        seenIds.add(post.id);
        return true;
      }) ?? [];

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // IntersectionObserver: 특정 DOM 요소가 화면(viewport)에 보이는지 감지하는 브라우저 API.
    const observer = new IntersectionObserver(
      ([entry]) => {
        // 화면에 보이고, 다음 페이지가 있고, 현재 로딩 중이 아닐 때만 다음 페이지를 요청한다.
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      // rootMargin: 실제 화면 끝에서 200px 앞에서부터 감지한다. 스크롤이 바닥에 닿기 전에 미리 로드.
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    // 컴포넌트가 사라질 때 observer 를 해제해 메모리 누수를 방지한다.
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    posts, // 화면에 렌더링할 글 목록 (전체 페이지 합산)
    isLoading: isFetchingNextPage, // 다음 페이지를 불러오는 중인지
    error, // 요청 실패 시 에러 객체
    hasMore: hasNextPage, // 더 불러올 페이지가 있는지
    loadMore: fetchNextPage, // 수동으로 다음 페이지를 불러오고 싶을 때 호출
    sentinelRef, // 목록 맨 아래 요소에 연결할 ref
  };
}

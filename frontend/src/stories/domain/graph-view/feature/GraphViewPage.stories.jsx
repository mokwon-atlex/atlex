import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import GraphViewPage from '@/components/domain/graph-view/feature/GraphViewPage';
import { toGraphViewData } from '@/lib/graph-view/graph-api-data';
import { splitNodeTitle } from '@/lib/graph-view/graph-view-utils';

const graphFixture = {
  nodes: [
    {
      id: 101,
      title: '정보 구조',
      authorId: 1,
      authorUserId: 'minji',
      authorName: '김민지',
      categoryId: 1,
      categoryName: '디자인',
      isPublic: true,
      tags: ['UX', '정보 구조'],
    },
    {
      id: 102,
      title: '디자인 시스템',
      authorId: 2,
      authorUserId: 'seojun',
      authorName: '이서준',
      categoryId: 1,
      categoryName: '디자인',
      isPublic: true,
      tags: ['UX', '디자인 시스템'],
    },
  ],
  edges: [
    {
      sourcePostId: 101,
      targetPostId: 102,
      score: 0.82,
      sharedKeywords: ['UX'],
    },
  ],
};

/** Storybook 렌더마다 독립된 API 캐시를 제공한다. */
function QueryClientDecorator(Story) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
}

/** @type { import('@storybook/nextjs-vite').Meta<typeof GraphViewPage> } */
const meta = {
  title: 'Domain/GraphView/Feature/GraphViewPage',
  component: GraphViewPage,
  decorators: [QueryClientDecorator],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    loadGraph: async () => graphFixture,
  },
  /** 실제 API 응답 형태의 노드와 관계가 화면에 표시되는지 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const graphData = toGraphViewData(graphFixture);

    await expect(graphData.posts).toHaveLength(2);
    await expect(graphData.edges[0]).toMatchObject({ from: '101', sharedTags: ['UX'], to: '102' });
    await expect(graphData.posts[0].color).not.toBe(graphData.posts[1].color);
    await expect(graphData.posts.every((post) => post.radius === 24)).toBe(true);
    await expect(splitNodeTitle('123456789012345678901')).toEqual(['1234567', '890123…']);
    const firstPostDistance = Math.hypot(graphData.posts[0].x - 420, graphData.posts[0].y - 320);
    const secondPostDistance = Math.hypot(graphData.posts[1].x - 420, graphData.posts[1].y - 320);

    await expect(firstPostDistance).toBeCloseTo(secondPostDistance);
    await expect(
      Math.hypot(graphData.posts[0].x - graphData.posts[1].x, graphData.posts[0].y - graphData.posts[1].y),
    ).toBeGreaterThan(300);
    await waitFor(() => expect(canvas.getByText('정보 구조')).toBeVisible());
    await expect(canvas.getByText('디자인 시스템')).toBeVisible();
    await expect(canvas.getByRole('button', { name: '정보 구조 게시글 열기' })).toHaveAttribute('tabindex', '0');
    await expect(canvasElement.querySelectorAll('linearGradient')).toHaveLength(1);
  },
};

export const Empty = {
  args: {
    loadGraph: async () => ({ edges: [], nodes: [] }),
  },
  /** 빈 응답일 때 원인을 알 수 있는 안내를 제공하는지 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByRole('heading', { name: '표시할 그래프가 없습니다' })).toBeVisible());
  },
};

export const Error = {
  args: {
    loadGraph: async () => Promise.reject(new Error('그래프 API 요청에 실패했습니다.')),
  },
  /** API 실패 시 재시도 동작을 제공하는지 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByRole('heading', { name: '그래프를 불러오지 못했습니다' })).toBeVisible());
    await expect(canvas.getByRole('button', { name: '다시 시도' })).toBeVisible();
  },
};

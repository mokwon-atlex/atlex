import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import GraphViewPage from '@/components/domain/graph-view/feature/GraphViewPage';
import { toGraphViewData } from '@/lib/graph-view/graph-api-data';
import { edgeWidth, graphNodeRadius, splitNodeTitle } from '@/lib/graph-view/graph-view-utils';

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
    {
      id: 103,
      title: '독립 노드',
      authorId: 3,
      authorUserId: 'jiwoo',
      authorName: '김지우',
      categoryId: 2,
      categoryName: '개발',
      isPublic: true,
      tags: ['AI'],
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

    await expect(graphData.posts).toHaveLength(3);
    await expect(graphData.edges[0]).toMatchObject({ from: '101', sharedTags: ['UX'], to: '102' });
    await expect(graphData.posts.every((post) => post.radius === 24)).toBe(true);
    await expect(splitNodeTitle('123456789012345678901')).toEqual(['1234567', '890123…']);
    await expect(graphNodeRadius(6)).toBeGreaterThan(graphNodeRadius(1));
    await expect(edgeWidth({ strength: 1 })).toBe(edgeWidth({ strength: 3 }));
    await expect(graphData.posts.every((post) => Number.isFinite(post.x) && Number.isFinite(post.y))).toBe(true);
    const nodeDistances = graphData.posts.flatMap((post, index) =>
      graphData.posts.slice(index + 1).map((otherPost) => Math.hypot(post.x - otherPost.x, post.y - otherPost.y)),
    );

    await expect(Math.min(...nodeDistances)).toBeGreaterThan(100);
    await waitFor(() => expect(canvas.getByText('정보 구조')).toBeVisible());
    await expect(canvas.getByText('디자인 시스템')).toBeVisible();
    const firstNode = canvas.getByRole('button', { name: '정보 구조 게시글 열기' });
    const graphEdge = canvasElement.querySelector('[data-graph-edge]');
    const graphSvg = canvasElement.querySelector('svg[viewBox="0 0 840 640"]');
    const graphLayer = graphSvg?.firstElementChild;

    await expect(firstNode).toHaveAttribute('tabindex', '0');
    await expect(graphEdge).not.toBeNull();
    await expect(graphSvg).not.toBeNull();
    await expect(graphLayer).toHaveAttribute('transform', 'translate(0 0) scale(1)');
    await fireEvent.wheel(graphSvg, { clientX: 420, clientY: 320, deltaY: -120 });
    await waitFor(() => expect(graphLayer).not.toHaveAttribute('transform', 'translate(0 0) scale(1)'));
    await userEvent.hover(firstNode);
    await waitFor(() => expect(canvas.getByText('디자인 카테고리 게시글')).toBeVisible());
    const popupRect = canvasElement.querySelector('[data-node-popup]').getBoundingClientRect();
    const popupCoversNode = [...canvasElement.querySelectorAll('[data-graph-node]')].some((node) => {
      const nodeRect = node.querySelector('circle').getBoundingClientRect();
      const nodeCenterX = nodeRect.left + nodeRect.width / 2;
      const nodeCenterY = nodeRect.top + nodeRect.height / 2;

      return (
        nodeCenterX >= popupRect.left &&
        nodeCenterX <= popupRect.right &&
        nodeCenterY >= popupRect.top &&
        nodeCenterY <= popupRect.bottom
      );
    });

    await expect(popupCoversNode).toBe(false);
    await expect(graphEdge).toHaveAttribute('opacity', '0.96');
    await expect(canvas.getByRole('button', { name: '독립 노드 게시글 열기' })).toHaveAttribute(
      'data-graph-node-state',
      'dimmed',
    );
    await expect(canvasElement.querySelectorAll('linearGradient')).toHaveLength(0);
    await expect(graphEdge.querySelectorAll('line')).toHaveLength(1);
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

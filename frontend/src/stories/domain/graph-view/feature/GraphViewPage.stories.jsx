import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import GraphViewPage from '@/components/domain/graph-view/feature/GraphViewPage';
import { toGraphViewData } from '@/lib/graph-view/graph-api-data';
import {
  MAX_BLOOM_ANIMATION_NODES,
  createPhysicsSimulation,
  isSimulationActive,
  pinSimulationNode,
  releaseSimulationNode,
  resetSimulationLayout,
  stepSimulation,
} from '@/lib/graph-view/graph-physics';
import { GRAPH_THEME_STORAGE_KEY, edgeWidth, graphNodeRadius, splitNodeTitle } from '@/lib/graph-view/graph-view-utils';

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

/** Storybook 렌더마다 독립된 API 캐시와 기본 그래프 테마 상태를 제공한다. */
function QueryClientDecorator(Story) {
  const [queryClient] = useState(() => {
    try {
      window.localStorage.removeItem(GRAPH_THEME_STORAGE_KEY);
    } catch {
      // 스토리지 접근이 불가능한 환경에서는 무시한다.
    }

    return new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

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
  /** 그래프 데이터 변환, 캔버스 테마 전환, 근처 팝업, 간선 툴팁, 물리 드래그와 카메라 포커스를 검증한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const graphData = toGraphViewData(graphFixture);

    await expect(graphData.posts).toHaveLength(3);
    await expect(graphData.edges[0]).toMatchObject({ from: '101', sharedTags: ['UX'], to: '102' });
    await expect(graphData.posts.every((post) => post.radius === 24)).toBe(true);
    await expect(splitNodeTitle('123456789012345678901')).toEqual(['1234567', '890123…']);
    await expect(graphNodeRadius(6)).toBeGreaterThan(graphNodeRadius(1));
    await expect(edgeWidth({ score: 0.9 })).toBeGreaterThan(edgeWidth({ score: 0.2 }));
    await expect(graphData.posts.every((post) => Number.isFinite(post.x) && Number.isFinite(post.y))).toBe(true);

    // 물리 시뮬레이션에서 드래그 고정 시 연결된 이웃 노드가 반응하고 리셋으로 복구되는지 확인한다.
    const simulation = createPhysicsSimulation(graphData.posts, graphData.edges, { animateEntry: false });
    const neighborBefore = { x: simulation.nodes[1].x, y: simulation.nodes[1].y };

    pinSimulationNode(simulation, '101', simulation.nodes[0].x + 140, simulation.nodes[0].y + 80);
    for (let step = 0; step < 12; step += 1) {
      stepSimulation(simulation);
    }
    const neighborAfterDrag = { x: simulation.nodes[1].x, y: simulation.nodes[1].y };

    const neighborDisplacement = Math.hypot(
      neighborAfterDrag.x - neighborBefore.x,
      neighborAfterDrag.y - neighborBefore.y,
    );

    await expect(neighborDisplacement).toBeGreaterThan(1);
    releaseSimulationNode(simulation);
    resetSimulationLayout(simulation, { animate: false });
    await expect(simulation.nodes[0].x).toBe(graphData.posts[0].x);

    // 대량 노드에서는 초기 전개 애니메이션을 생략해 프레임 드롭을 방지하는지 확인한다.
    const densePosts = Array.from({ length: MAX_BLOOM_ANIMATION_NODES + 5 }, (_, index) => ({
      id: `dense-${index}`,
      categoryName: '개발',
      x: (index % 8) * 90,
      y: Math.floor(index / 8) * 90,
    }));
    const denseSimulation = createPhysicsSimulation(densePosts, [], { animateEntry: true });

    await expect(isSimulationActive(denseSimulation)).toBe(false);

    const nodeDistances = graphData.posts.flatMap((post, index) =>
      graphData.posts.slice(index + 1).map((otherPost) => Math.hypot(post.x - otherPost.x, post.y - otherPost.y)),
    );

    await expect(Math.min(...nodeDistances)).toBeGreaterThan(100);
    await waitFor(() => expect(canvas.getByText('정보 구조')).toBeVisible());
    await expect(canvas.getByText('디자인 시스템')).toBeVisible();

    const firstNode = canvas.getByRole('button', { name: '정보 구조 게시글 열기' });
    const graphEdge = canvasElement.querySelector('[data-graph-edge]');
    const graphSvg = canvasElement.querySelector('svg[viewBox="0 0 840 640"]');
    const graphLayer = graphSvg?.querySelector(':scope > g[transform]');

    await expect(firstNode).toHaveAttribute('tabindex', '0');
    await expect(graphEdge).not.toBeNull();
    await expect(graphSvg).not.toBeNull();
    await expect(graphSvg).toHaveAttribute('data-canvas-theme', 'dark');
    await expect(graphLayer).toHaveAttribute('transform', 'translate(0 0) scale(1)');

    // 툴바의 캔버스 테마 토글이 다크 <-> 라이트 전환과 localStorage 저장을 수행하는지 확인한다.
    const themeToggle = canvas.getByRole('button', { name: '라이트 캔버스로 전환' });

    await userEvent.click(themeToggle);
    await expect(graphSvg).toHaveAttribute('data-canvas-theme', 'light');
    await expect(window.localStorage.getItem(GRAPH_THEME_STORAGE_KEY)).toBe('light');

    const backToDarkToggle = canvas.getByRole('button', { name: '다크 캔버스로 전환' });

    await userEvent.click(backToDarkToggle);
    await expect(graphSvg).toHaveAttribute('data-canvas-theme', 'dark');
    await expect(window.localStorage.getItem(GRAPH_THEME_STORAGE_KEY)).toBe('dark');

    // 휠 확대 시 변환 행렬이 갱신되는지 확인한다.
    await fireEvent.wheel(graphSvg, { clientX: 420, clientY: 320, deltaY: -120 });
    await waitFor(() => expect(graphLayer).not.toHaveAttribute('transform', 'translate(0 0) scale(1)'));

    // 노드 호버 시 노드 근처 컴팩트 팝업, 간선 키워드 툴팁과 연결 강조가 표시되는지 확인한다.
    await userEvent.hover(firstNode);
    await waitFor(() => expect(canvas.getByText('디자인 카테고리')).toBeVisible());
    await expect(canvas.getByText('연결 1')).toBeVisible();
    await expect(canvasElement.querySelector('[data-edge-keyword-tooltip]')).not.toBeNull();

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
    await expect(graphEdge).toHaveAttribute('opacity', '0.94');
    await expect(canvas.getByRole('button', { name: '독립 노드 게시글 열기' })).toHaveAttribute(
      'data-graph-node-state',
      'dimmed',
    );
    await expect(canvasElement.querySelectorAll('linearGradient')).toHaveLength(0);
    await expect(graphEdge.querySelectorAll('line')).toHaveLength(1);

    // 노드 드래그로 좌표가 이동하고 배치 재정렬 버튼이 동작하는지 확인한다.
    const firstCircle = firstNode.querySelector('circle');
    const beforeCx = Number(firstCircle.getAttribute('cx'));
    const nodeRect = firstCircle.getBoundingClientRect();
    const startClientX = nodeRect.left + nodeRect.width / 2;
    const startClientY = nodeRect.top + nodeRect.height / 2;

    await fireEvent.pointerDown(firstNode, {
      bubbles: true,
      clientX: startClientX,
      clientY: startClientY,
      pointerId: 1,
    });
    await fireEvent.pointerMove(graphSvg, {
      bubbles: true,
      clientX: startClientX + 90,
      clientY: startClientY + 45,
      pointerId: 1,
    });
    await waitFor(() => expect(Math.abs(Number(firstCircle.getAttribute('cx')) - beforeCx)).toBeGreaterThan(20));
    await fireEvent.pointerUp(graphSvg, { bubbles: true, pointerId: 1 });

    await userEvent.click(canvas.getByRole('button', { name: '배치 재정렬' }));

    // 포스트 목록 패널에서 항목을 선택하면 카메라가 해당 노드로 이동하는지 확인한다.
    const transformBeforeFocus = graphLayer.getAttribute('transform');

    await userEvent.click(canvas.getByRole('button', { name: '포스트 목록' }));
    const listPanel = within(canvasElement.querySelector('aside'));

    await userEvent.click(listPanel.getByRole('button', { name: /독립 노드/ }));
    await waitFor(() => expect(graphLayer.getAttribute('transform')).not.toBe(transformBeforeFocus));
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

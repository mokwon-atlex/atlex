import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import GraphViewPage from '@/components/domain/graph-view/feature/GraphViewPage';
import { computeGraphLayout, toGraphViewData } from '@/lib/graph-view/graph-api-data';
import {
  GRAPH_THEME_STORAGE_KEY,
  SVG_H,
  SVG_W,
  edgeWidth,
  graphNodeRadius,
  splitNodeTitle,
} from '@/lib/graph-view/graph-view-utils';

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
    {
      sourcePostId: 102,
      targetPostId: 101,
      score: 0.64,
      sharedKeywords: ['UX', '정보 구조'],
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
  /** 중앙 연결 코어·외곽 고립 링 배치, 천체도 라이트 테마, 단순화 필터, 간선 회피 팝업을 검증한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const graphData = toGraphViewData(graphFixture);
    const centerX = SVG_W / 2;
    const centerY = SVG_H / 2;

    await expect(graphData.posts).toHaveLength(3);
    await expect(graphData.edges).toHaveLength(1);
    await expect(graphData.edges[0]).toMatchObject({
      from: '101',
      score: 0.82,
      sharedTags: ['UX', '정보 구조'],
      to: '102',
    });
    await expect(splitNodeTitle('123456789012345678901')).toEqual(['1234567', '890123…']);
    await expect(graphNodeRadius(6)).toBeGreaterThan(graphNodeRadius(1));
    await expect(edgeWidth({ score: 0.9 })).toBeGreaterThan(edgeWidth({ score: 0.2 }));

    // 연결된 노드(101, 102)는 가운데 코어에, 고립된 노드(103)는 그 바깥 링에 배치되는지 검증한다.
    const connectedA = graphData.posts.find((post) => post.id === '101');
    const connectedB = graphData.posts.find((post) => post.id === '102');
    const isolated = graphData.posts.find((post) => post.id === '103');
    const connectedMaxDist = Math.max(
      Math.hypot(connectedA.x - centerX, connectedA.y - centerY),
      Math.hypot(connectedB.x - centerX, connectedB.y - centerY),
    );
    const isolatedDist = Math.hypot(isolated.x - centerX, isolated.y - centerY);

    await expect(isolatedDist).toBeGreaterThan(connectedMaxDist + 40);

    // 필터로 간선이 사라지면 모든 노드가 외곽 링 기준으로 재계산되는지 확인한다.
    const noEdgeLayout = computeGraphLayout(graphData.posts, []);
    await expect(noEdgeLayout.layoutMeta.outerRingRadii.length).toBeGreaterThan(0);

    await waitFor(() => expect(canvas.getByText('정보 구조')).toBeVisible());
    await expect(canvas.getByText('디자인 시스템')).toBeVisible();

    const firstNode = canvas.getByRole('button', { name: '정보 구조 게시글 열기' });
    const graphEdge = canvasElement.querySelector('[data-graph-edge]');
    const graphSvg = canvasElement.querySelector('svg[viewBox="0 0 840 640"]');
    const graphLayer = graphSvg?.querySelector(':scope > g[transform]');

    await expect(firstNode).toHaveAttribute('tabindex', '0');
    await expect(graphEdge).not.toBeNull();
    await expect(canvasElement.querySelectorAll('[data-graph-edge]')).toHaveLength(1);
    await expect(graphSvg).toHaveAttribute('data-canvas-theme', 'dark');
    await expect(canvas.queryByRole('button', { name: '배치 재정렬' })).toBeNull();
    await expect(canvas.queryByRole('button', { name: '포스트 목록' })).toBeNull();

    // 라이트 캔버스 전환 시 고전 천체도(아틀라스 성도) 가이드 레이어가 렌더링되는지 확인한다.
    await userEvent.click(canvas.getByRole('button', { name: '라이트 캔버스로 전환' }));
    await expect(graphSvg).toHaveAttribute('data-canvas-theme', 'light');
    await expect(canvasElement.querySelector('[data-celestial-guides="true"]')).not.toBeNull();
    await expect(window.localStorage.getItem(GRAPH_THEME_STORAGE_KEY)).toBe('light');

    await userEvent.click(canvas.getByRole('button', { name: '다크 캔버스로 전환' }));
    await expect(graphSvg).toHaveAttribute('data-canvas-theme', 'dark');
    await expect(canvasElement.querySelector('[data-celestial-guides="true"]')).toBeNull();

    // 좌측 탐색·필터 패널에 검색, 표시 옵션(고립 노드 토글), 연결 기준, 핵심 허브 글과 통계가 구성되는지 확인한다.
    await userEvent.click(canvas.getByRole('button', { name: '필터 패널' }));
    const sidebar = within(canvasElement.querySelector('aside'));

    await expect(sidebar.getByText('표시 옵션')).toBeVisible();
    await expect(sidebar.getByText('연결 기준')).toBeVisible();
    await expect(sidebar.getByText('핵심 허브 글')).toBeVisible();
    await expect(sidebar.getByText('연결 노드')).toBeVisible();
    await expect(sidebar.getByText('고립 노드')).toBeVisible();
    await expect(sidebar.queryByLabelText('작성자 검색')).toBeNull();
    await expect(sidebar.queryByLabelText('태그 검색')).toBeNull();

    // 고립 노드 표시 토글을 끄면 독립 노드가 숨겨지고, 다시 켜면 복원되는지 확인한다.
    await userEvent.click(sidebar.getByRole('button', { name: '고립 노드 표시' }));
    await waitFor(() => expect(canvas.queryByRole('button', { name: '독립 노드 게시글 열기' })).toBeNull());
    await userEvent.click(sidebar.getByRole('button', { name: '고립 노드 표시' }));
    await waitFor(() => expect(canvas.getByRole('button', { name: '독립 노드 게시글 열기' })).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: '필터 패널' }));

    // 휠 확대 시 변환 행렬이 갱신되는지 확인한다.
    await fireEvent.wheel(graphSvg, { clientX: 420, clientY: 320, deltaY: -120 });
    await waitFor(() => expect(graphLayer).not.toHaveAttribute('transform', 'translate(0 0) scale(1)'));

    // 노드 호버 시 안내 문구와 간선 태그 배지 없이 깔끔한 미리보기 팝업이 표시되는지 확인한다.
    await userEvent.hover(firstNode);
    await waitFor(() => expect(canvas.getByText('디자인 카테고리')).toBeVisible());
    await expect(canvas.getByText('연결 1')).toBeVisible();
    await expect(canvas.queryByText('드래그로 재배치')).toBeNull();
    await expect(canvas.queryByText(/클릭해 읽기/)).toBeNull();
    await expect(canvasElement.querySelector('[data-edge-keyword-tooltip]')).toBeNull();

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

    // 노드 위에서 드래그해도 노드의 그래프 좌표(cx)가 고정되어 움직이지 않는지 확인한다.
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
      clientX: startClientX + 80,
      clientY: startClientY + 40,
      pointerId: 1,
    });
    await fireEvent.pointerUp(graphSvg, { bubbles: true, pointerId: 1 });
    await expect(Number(firstCircle.getAttribute('cx'))).toBe(beforeCx);

    // 좌측 탐색·필터 패널의 노드 빠른 검색에서 항목을 선택하면 카메라가 해당 노드로 이동하는지 확인한다.
    const transformBeforeFocus = graphLayer.getAttribute('transform');

    await userEvent.click(canvas.getByRole('button', { name: '필터 패널' }));
    const searchSidebar = within(canvasElement.querySelector('aside'));

    await userEvent.type(searchSidebar.getByLabelText('글 제목 검색'), '독립');
    await userEvent.click(searchSidebar.getByRole('button', { name: /독립 노드/ }));
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

'use client';

import { useQuery } from '@tanstack/react-query';
import { HelpCircle, LoaderCircle, Maximize2, Minus, Plus, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { GraphCanvas } from '@/components/domain/graph-view/feature/GraphCanvas';
import { FilterSidebar } from '@/components/domain/graph-view/layout/FilterSidebar';
import { GraphToolbar } from '@/components/domain/graph-view/layout/GraphToolbar';
import { CanvasButton } from '@/components/domain/graph-view/ui/CanvasButton';
import { GraphLegend } from '@/components/domain/graph-view/ui/GraphLegend';
import { NodePopup } from '@/components/domain/graph-view/ui/NodePopup';
import { fetchPostGraph, fetchPostGraphByPostId } from '@/lib/api/graph';
import { computeGraphLayout, toGraphViewData } from '@/lib/graph-view/graph-api-data';
import {
  GRAPH_THEME_STORAGE_KEY,
  SVG_H,
  SVG_W,
  clamp,
  getGraphTheme,
  graphNodeRadius,
} from '@/lib/graph-view/graph-view-utils';
import { postDetailHref } from '@/lib/url/handle';
import { useAuthStore } from '@/store/authStore';

const CAMERA_ANIMATION_MS = 320;
const LEFT_SIDEBAR_WIDTH = 288;
const MAX_HUB_POSTS = 5;

/** 사용자가 움직임 최소화 설정을 켰는지 확인한다. */
function prefersReducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
}

/** 캔버스 테마(밤하늘 다크 / 고전 천체도 라이트)와 확대·이동 상태에 맞는 무한 타일링 배경 스타일을 만든다. */
function createCanvasBackdropStyle(canvasTheme, pan, zoom) {
  const theme = getGraphTheme(canvasTheme);

  if (canvasTheme === 'light') {
    const stippleSpacing = Math.max(18, Math.round(28 * zoom));
    const offsetX = Math.round(pan.x % stippleSpacing);
    const offsetY = Math.round(pan.y % stippleSpacing);

    return {
      backgroundImage: `radial-gradient(circle, ${theme.dotColor} 1px, transparent 1px), ${theme.canvasBackground}`,
      backgroundPosition: `${offsetX}px ${offsetY}px, 0 0`,
      backgroundSize: `${stippleSpacing}px ${stippleSpacing}px, 100% 100%`,
    };
  }

  const nearX = Math.round((pan.x * 0.25) % 180);
  const nearY = Math.round((pan.y * 0.25) % 180);
  const farX = Math.round((pan.x * 0.12) % 260);
  const farY = Math.round((pan.y * 0.12) % 260);

  return {
    backgroundImage: [
      'radial-gradient(1.1px 1.1px at 24px 36px, rgba(254, 240, 138, 0.42), transparent)',
      'radial-gradient(1px 1px at 112px 92px, rgba(253, 224, 71, 0.34), transparent)',
      'radial-gradient(1.2px 1.2px at 190px 148px, rgba(224, 242, 254, 0.32), transparent)',
      theme.canvasBackground,
    ].join(', '),
    backgroundPosition: `${nearX}px ${nearY}px, ${farX}px ${farY}px, ${nearX + 60}px ${farY + 40}px, 0 0`,
    backgroundSize: '180px 180px, 260px 260px, 220px 220px, 100% 100%',
  };
}

/**
 * 서버 그래프 데이터를 조회하고, 고정 동심 배치(가운데 연결 코어 + 바깥 고립 링),
 * 밤하늘/고전 천체도 테마와 간선 회피 미리보기를 제공한다.
 *
 * @param {{ categoryId?: number, loadGraph?: Function, minScore?: number, postId?: number, userId?: string }} props URL 조회 조건
 */
export default function GraphViewPage({ categoryId, loadGraph, minScore, postId, userId }) {
  const router = useRouter();
  const currentUserId = useAuthStore((state) => state.user?.userId);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [activeTab, setActiveTab] = useState('all');
  const [canvasTheme, setCanvasTheme] = useState('dark');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isCanvasInteracting, setIsCanvasInteracting] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showIsolatedNodes, setShowIsolatedNodes] = useState(true);
  const [alwaysShowLabels, setAlwaysShowLabels] = useState(false);
  const [showTagEdges, setShowTagEdges] = useState(true);
  const [showExplicitEdges, setShowExplicitEdges] = useState(false);
  const [minSharedTags, setMinSharedTags] = useState(1);
  const [popupPos, setPopupPos] = useState(null);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const cameraRafRef = useRef(null);
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  const resolvedCurrentUserId = currentUserId == null ? null : String(currentUserId);
  const requestedUserId = activeTab === 'mine' ? resolvedCurrentUserId : userId;
  const activeCanvasTheme = getGraphTheme(canvasTheme);

  panRef.current = pan;
  zoomRef.current = zoom;

  // 마운트 시 브라우저에 저장된 그래프 전용 캔버스 테마를 복원한다. (기본값: dark)
  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(GRAPH_THEME_STORAGE_KEY);

      if (savedTheme === 'light' || savedTheme === 'dark') {
        setCanvasTheme(savedTheme);
      }
    } catch {
      // 스토리지 접근이 제한된 환경에서는 기본 다크 캔버스를 유지한다.
    }
  }, []);

  const graphQuery = useQuery({
    queryKey: ['post-graph', { categoryId, minScore, postId, userId: requestedUserId }],
    queryFn: () => {
      const query = { categoryId, minScore, postId, userId: requestedUserId };

      if (loadGraph) {
        return loadGraph(query);
      }

      if (activeTab === 'mine') {
        return fetchPostGraph({ categoryId, minScore, userId: requestedUserId });
      }

      return postId != null
        ? fetchPostGraphByPostId(postId, { minScore })
        : fetchPostGraph({ categoryId, minScore, userId: requestedUserId });
    },
    enabled: activeTab !== 'mine' || Boolean(resolvedCurrentUserId),
  });

  const graphData = useMemo(() => toGraphViewData(graphQuery.data), [graphQuery.data]);
  const { edges, posts } = graphData;
  const hasExplicitEdges = edges.some((edge) => edge.isExplicit);

  const scopedPosts = useMemo(
    () => (activeTab === 'mine' ? posts.filter((post) => post.author.id === resolvedCurrentUserId) : posts),
    [activeTab, posts, resolvedCurrentUserId],
  );
  const scopedPostIds = useMemo(() => new Set(scopedPosts.map((post) => post.id)), [scopedPosts]);
  const displayedEdges = useMemo(
    () =>
      edges.filter((edge) => {
        if (!scopedPostIds.has(edge.from) || !scopedPostIds.has(edge.to)) {
          return false;
        }

        return edge.isExplicit ? showExplicitEdges : showTagEdges && edge.strength >= minSharedTags;
      }),
    [edges, minSharedTags, scopedPostIds, showExplicitEdges, showTagEdges],
  );

  const displayedConnectionCountById = useMemo(() => {
    const counts = new Map();

    displayedEdges.forEach((edge) => {
      counts.set(edge.from, (counts.get(edge.from) ?? 0) + 1);
      counts.set(edge.to, (counts.get(edge.to) ?? 0) + 1);
    });

    return counts;
  }, [displayedEdges]);

  const visiblePosts = useMemo(
    () =>
      showIsolatedNodes
        ? scopedPosts
        : scopedPosts.filter((post) => (displayedConnectionCountById.get(post.id) ?? 0) > 0),
    [displayedConnectionCountById, scopedPosts, showIsolatedNodes],
  );

  // 현재 표시 중인 노드·간선과 탭 기준에 맞춰 연결 노드(가운데) + 고립 노드(바깥 링) 좌표를 결정론적으로 계산한다.
  const { layoutMeta, positionedPosts } = useMemo(() => {
    const computed = computeGraphLayout(visiblePosts, displayedEdges, {
      groupByCategory: activeTab === 'category',
    });

    return {
      layoutMeta: computed.layoutMeta,
      positionedPosts: visiblePosts.map((post, index) => ({
        ...post,
        x: computed.positions[index].x,
        y: computed.positions[index].y,
      })),
    };
  }, [activeTab, displayedEdges, visiblePosts]);

  const positionedPostsRef = useRef(positionedPosts);
  positionedPostsRef.current = positionedPosts;

  const topHubPosts = useMemo(
    () =>
      scopedPosts
        .map((post) => ({ degree: displayedConnectionCountById.get(post.id) ?? 0, post }))
        .filter((item) => item.degree > 0)
        .sort((left, right) => right.degree - left.degree || left.post.title.localeCompare(right.post.title, 'ko'))
        .slice(0, MAX_HUB_POSTS),
    [displayedConnectionCountById, scopedPosts],
  );

  const filterStats = useMemo(() => {
    let connectedNodes = 0;

    scopedPosts.forEach((post) => {
      if ((displayedConnectionCountById.get(post.id) ?? 0) > 0) {
        connectedNodes += 1;
      }
    });

    return {
      connectedNodes,
      edges: displayedEdges.length,
      isolatedNodes: Math.max(0, scopedPosts.length - connectedNodes),
      posts: visiblePosts.length,
    };
  }, [displayedConnectionCountById, displayedEdges.length, scopedPosts, visiblePosts.length]);

  const popupPost = useMemo(
    () => positionedPosts.find((post) => post.id === (hoveredId ?? selectedId)) ?? null,
    [hoveredId, positionedPosts, selectedId],
  );
  const popupConnectionCount = popupPost ? (displayedConnectionCountById.get(popupPost.id) ?? 0) : 0;

  /** 진행 중인 카메라 포커스 이동 애니메이션을 중단한다. */
  const cancelCameraAnimation = useCallback(() => {
    if (cameraRafRef.current != null) {
      cancelAnimationFrame(cameraRafRef.current);
      cameraRafRef.current = null;
    }
  }, []);

  useEffect(() => cancelCameraAnimation, [cancelCameraAnimation]);

  useEffect(() => {
    setSelectedId((previousId) => (scopedPosts.some((post) => post.id === previousId) ? previousId : null));
  }, [scopedPosts]);

  // 호버·선택된 노드 근처에서 다른 노드와 연결선(간선)을 모두 가장 적게 가리는 팝업 좌표를 계산한다.
  useEffect(() => {
    const svg = svgRef.current;
    const container = containerRef.current;

    if (isCanvasInteracting || !popupPost || !svg || !container) {
      setPopupPos(null);
      return undefined;
    }

    const updatePopupPosition = () => {
      const ctm = svg.getScreenCTM();

      if (!ctm) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const projectNode = (node) => {
        const point = svg.createSVGPoint();

        point.x = node.x * zoom + pan.x;
        point.y = node.y * zoom + pan.y;
        const screenPoint = point.matrixTransform(ctm);

        return {
          id: node.id,
          x: screenPoint.x - containerRect.left,
          y: screenPoint.y - containerRect.top,
        };
      };

      const screenById = new Map(positionedPosts.map((node) => [node.id, projectNode(node)]));
      const targetScreenPoint = screenById.get(popupPost.id);

      if (!targetScreenPoint) {
        return;
      }

      const otherNodePositions = positionedPosts
        .filter((item) => item.id !== popupPost.id)
        .map((item) => screenById.get(item.id))
        .filter(Boolean);
      const screenEdges = displayedEdges
        .map((edge) => {
          const from = screenById.get(edge.from);
          const to = screenById.get(edge.to);

          if (!from || !to) {
            return null;
          }

          return {
            from,
            isConnectedToTarget: edge.from === popupPost.id || edge.to === popupPost.id,
            to,
          };
        })
        .filter(Boolean);

      const nodeRadius = graphNodeRadius(displayedConnectionCountById.get(popupPost.id) ?? 0);
      const scaleFactor = Math.hypot(ctm.a, ctm.b) || 1;
      const targetScreenRadius = nodeRadius * zoom * scaleFactor;
      const insets = {
        left: showSidebar ? LEFT_SIDEBAR_WIDTH : 0,
        right: 0,
      };

      setPopupPos(
        findNearbyPopupPosition(
          containerRect,
          targetScreenPoint,
          targetScreenRadius,
          otherNodePositions,
          screenEdges,
          insets,
        ),
      );
    };

    updatePopupPosition();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(updatePopupPosition);

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [
    displayedConnectionCountById,
    displayedEdges,
    isCanvasInteracting,
    pan,
    popupPost,
    positionedPosts,
    showSidebar,
    zoom,
  ]);

  /** 그래프 전용 라이트·다크 캔버스 테마를 전환하고 브라우저에 저장한다. */
  const handleToggleCanvasTheme = useCallback(() => {
    setCanvasTheme((previous) => {
      const nextTheme = previous === 'dark' ? 'light' : 'dark';

      try {
        window.localStorage.setItem(GRAPH_THEME_STORAGE_KEY, nextTheme);
      } catch {
        // 스토리지 저장이 실패해도 현재 화면 테마 전환은 유지한다.
      }

      return nextTheme;
    });
  }, []);

  /** 선택한 노드가 화면 중앙에 오도록 캔버스 카메라를 부드럽게 이동한다. */
  const focusNodeInViewport = useCallback(
    (nodeId) => {
      const targetPost = positionedPostsRef.current.find((post) => post.id === nodeId);

      if (!targetPost) {
        return;
      }

      cancelCameraAnimation();
      const currentZoom = zoomRef.current;
      const targetPan = {
        x: SVG_W / 2 - targetPost.x * currentZoom,
        y: SVG_H / 2 - targetPost.y * currentZoom,
      };

      if (prefersReducedMotion()) {
        setPan(targetPan);
        return;
      }

      const startPan = { ...panRef.current };
      const startTime = performance.now();

      const animateCamera = (now) => {
        const elapsed = now - startTime;
        const progress = clamp(elapsed / CAMERA_ANIMATION_MS, 0, 1);
        const eased = 1 - (1 - progress) ** 3;

        setPan({
          x: startPan.x + (targetPan.x - startPan.x) * eased,
          y: startPan.y + (targetPan.y - startPan.y) * eased,
        });

        if (progress < 1) {
          cameraRafRef.current = requestAnimationFrame(animateCamera);
        } else {
          cameraRafRef.current = null;
        }
      };

      cameraRafRef.current = requestAnimationFrame(animateCamera);
    },
    [cancelCameraAnimation],
  );

  /** 표시 옵션과 연결 기준 필터를 기본값으로 되돌린다. */
  const resetFilters = useCallback(() => {
    setShowIsolatedNodes(true);
    setAlwaysShowLabels(false);
    setShowTagEdges(true);
    setShowExplicitEdges(false);
    setMinSharedTags(1);
  }, []);

  /** 검색 결과·허브 목록에서 노드를 선택하고 해당 위치로 카메라를 포커스한다. */
  const handleSelect = useCallback(
    (id) => {
      setSelectedId(id);

      if (!id) {
        return;
      }

      const isHiddenIsolated = !showIsolatedNodes && (displayedConnectionCountById.get(id) ?? 0) === 0;

      if (isHiddenIsolated) {
        setShowIsolatedNodes(true);
        requestAnimationFrame(() => focusNodeInViewport(id));
        return;
      }

      focusNodeInViewport(id);
    },
    [displayedConnectionCountById, focusNodeInViewport, showIsolatedNodes],
  );

  /** 클릭한 노드의 게시글 상세 화면으로 이동한다. */
  const handleOpenPost = useCallback(
    (id) => {
      const post = scopedPosts.find((item) => item.id === id);

      if (post) {
        router.push(postDetailHref(post.author.id, post.id));
      }
    },
    [router, scopedPosts],
  );

  const graphState = getGraphState({ activeTab, graphQuery, isLoggedIn, posts });
  const canvasBackdropStyle = useMemo(
    () => createCanvasBackdropStyle(canvasTheme, pan, zoom),
    [canvasTheme, pan, zoom],
  );
  const leftControlsOffset = showSidebar ? 'left-[19rem]' : 'left-4';

  return (
    <div className="flex h-[calc(100vh-73px)] min-h-[640px] flex-col overflow-hidden border-t border-border bg-background text-foreground">
      <GraphToolbar
        activeTab={activeTab}
        canvasTheme={canvasTheme}
        isLoggedIn={isLoggedIn}
        isOwnerScope={Boolean(userId && resolvedCurrentUserId && userId === resolvedCurrentUserId)}
        onToggleCanvasTheme={handleToggleCanvasTheme}
        scopedUserId={userId ?? null}
        setActiveTab={setActiveTab}
        setShowSidebar={setShowSidebar}
        showSidebar={showSidebar}
      />

      {graphState ? (
        <div className="flex min-h-0 flex-1 overflow-hidden" style={{ background: activeCanvasTheme.canvasBackground }}>
          <GraphStatus {...graphState} canvasTheme={canvasTheme} />
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <main
            ref={containerRef}
            className="relative min-w-0 flex-1 overflow-hidden"
            data-graph-canvas-container
            style={canvasBackdropStyle}
          >
            <GraphCanvas
              activeTab={activeTab}
              alwaysShowLabels={alwaysShowLabels}
              canvasTheme={canvasTheme}
              edges={displayedEdges}
              hoveredId={hoveredId}
              layoutMeta={layoutMeta}
              onHover={setHoveredId}
              onInteractionChange={setIsCanvasInteracting}
              onManualViewportChange={cancelCameraAnimation}
              onOpenPost={handleOpenPost}
              pan={pan}
              posts={positionedPosts}
              selectedId={selectedId}
              setPan={setPan}
              setZoom={setZoom}
              svgRef={svgRef}
              zoom={zoom}
            />

            {positionedPosts.length === 0 ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                <div className="rounded-xl border border-border/80 bg-card/90 px-4 py-3 text-center text-xs font-bold text-muted-foreground shadow-sm backdrop-blur-md">
                  표시할 노드가 없습니다. 필터에서 고립 노드 표시를 켜거나 연결 조건을 완화해 보세요.
                </div>
              </div>
            ) : null}

            {showLegend ? <GraphLegend canvasTheme={canvasTheme} offsetLeftClass={leftControlsOffset} /> : null}

            <div className="absolute right-4 bottom-6 z-20 flex flex-col gap-1.5">
              <CanvasButton
                label="확대"
                onClick={() => {
                  cancelCameraAnimation();
                  setZoom((value) => Math.min(value + 0.15, 2.5));
                }}
              >
                <Plus className="size-4" />
              </CanvasButton>
              <CanvasButton
                label="축소"
                onClick={() => {
                  cancelCameraAnimation();
                  setZoom((value) => Math.max(value - 0.15, 0.3));
                }}
              >
                <Minus className="size-4" />
              </CanvasButton>
              <CanvasButton
                label="맞춤"
                onClick={() => {
                  cancelCameraAnimation();
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
              >
                <Maximize2 className="size-3.5" />
              </CanvasButton>
            </div>

            <button
              type="button"
              aria-label="범례"
              aria-pressed={showLegend}
              className={`absolute bottom-6 ${leftControlsOffset} z-20 flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-card/90 text-muted-foreground shadow-2xs backdrop-blur-xs transition-[left,color,background-color,border-color] duration-200 hover:border-foreground/25 hover:bg-accent hover:text-foreground aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground`}
              onClick={() => setShowLegend((value) => !value)}
            >
              <HelpCircle className="size-4" />
            </button>

            {popupPost && popupPos ? (
              <NodePopup connectionCount={popupConnectionCount} position={popupPos} post={popupPost} />
            ) : null}
          </main>

          {showSidebar ? (
            <FilterSidebar
              alwaysShowLabels={alwaysShowLabels}
              connectionCountById={displayedConnectionCountById}
              hasExplicitEdges={hasExplicitEdges}
              minSharedTags={minSharedTags}
              onSelectPost={handleSelect}
              posts={scopedPosts}
              resetFilters={resetFilters}
              selectedId={selectedId}
              setAlwaysShowLabels={setAlwaysShowLabels}
              setMinSharedTags={setMinSharedTags}
              setShowExplicitEdges={setShowExplicitEdges}
              setShowIsolatedNodes={setShowIsolatedNodes}
              setShowTagEdges={setShowTagEdges}
              showExplicitEdges={showExplicitEdges}
              showIsolatedNodes={showIsolatedNodes}
              showTagEdges={showTagEdges}
              stats={filterStats}
              topHubPosts={topHubPosts}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

/**
 * 대상 노드 주변 후보 중 화면 경계 안에서 다른 노드와 연결선(간선)을 가장 적게 가리는 위치를 찾는다.
 * 연결된 간선들의 평균 반대 방향을 최우선 후보로 추가해 선 위로 팝업이 겹치지 않게 유도한다.
 */
function findNearbyPopupPosition(
  containerRect,
  targetPoint,
  targetRadius,
  otherNodePositions,
  screenEdges,
  insets = { left: 0, right: 0 },
) {
  const margin = 12;
  const leftBound = insets.left + margin;
  const rightBound = Math.max(leftBound, containerRect.width - insets.right - margin);
  const availableWidth = Math.max(0, rightBound - leftBound);
  const popupWidth = Math.min(248, availableWidth);
  const popupHeight = Math.min(164, Math.max(0, containerRect.height - margin * 2));
  const maxX = Math.max(leftBound, rightBound - popupWidth);
  const maxY = Math.max(margin, containerRect.height - popupHeight - margin);
  const baseGap = Math.max(22, targetRadius + 16);
  const rawCandidates = [];

  // 대상 노드에 연결된 간선들의 반대 방향(빈 공간)을 우선 후보에 추가한다.
  let edgeSumX = 0;
  let edgeSumY = 0;

  screenEdges.forEach((edge) => {
    if (!edge.isConnectedToTarget) {
      return;
    }

    const other =
      Math.hypot(edge.from.x - targetPoint.x, edge.from.y - targetPoint.y) <
      Math.hypot(edge.to.x - targetPoint.x, edge.to.y - targetPoint.y)
        ? edge.to
        : edge.from;
    const dx = other.x - targetPoint.x;
    const dy = other.y - targetPoint.y;
    const length = Math.hypot(dx, dy);

    if (length > 1) {
      edgeSumX += dx / length;
      edgeSumY += dy / length;
    }
  });

  const escapeLen = Math.hypot(edgeSumX, edgeSumY);

  if (escapeLen > 0.05) {
    const awayX = -edgeSumX / escapeLen;
    const awayY = -edgeSumY / escapeLen;

    [baseGap, baseGap + 36].forEach((offset) => {
      const centerX = targetPoint.x + awayX * (offset + popupWidth / 2);
      const centerY = targetPoint.y + awayY * (offset + popupHeight / 2);

      rawCandidates.push({ x: centerX - popupWidth / 2, y: centerY - popupHeight / 2 });
    });
  }

  [baseGap, baseGap + 36].forEach((gap) => {
    const diagonalGap = gap * 0.82;

    rawCandidates.push(
      { x: targetPoint.x + gap, y: targetPoint.y - popupHeight / 2 },
      { x: targetPoint.x - gap - popupWidth, y: targetPoint.y - popupHeight / 2 },
      { x: targetPoint.x - popupWidth / 2, y: targetPoint.y + gap },
      { x: targetPoint.x - popupWidth / 2, y: targetPoint.y - gap - popupHeight },
      { x: targetPoint.x + diagonalGap, y: targetPoint.y + diagonalGap },
      { x: targetPoint.x - diagonalGap - popupWidth, y: targetPoint.y + diagonalGap },
      { x: targetPoint.x + diagonalGap, y: targetPoint.y - diagonalGap - popupHeight },
      { x: targetPoint.x - diagonalGap - popupWidth, y: targetPoint.y - diagonalGap - popupHeight },
    );
  });

  const bestPosition = rawCandidates.reduce(
    (best, rawCandidate, index) => {
      const clamped = {
        x: clamp(rawCandidate.x, leftBound, maxX),
        y: clamp(rawCandidate.y, margin, maxY),
      };
      const score = calculateNearbyPopupScore(
        clamped,
        targetPoint,
        targetRadius,
        otherNodePositions,
        screenEdges,
        popupWidth,
        popupHeight,
        index,
      );

      return score < best.score ? { ...clamped, score } : best;
    },
    { score: Number.POSITIVE_INFINITY, x: leftBound, y: margin },
  );

  return { maxHeight: popupHeight, width: popupWidth, x: bestPosition.x, y: bestPosition.y };
}

/** 대상 노드 가림 방지, 다른 노드 회피, 연결선(간선) 교차 회피와 근접성을 종합 점수화한다. */
function calculateNearbyPopupScore(
  position,
  targetPoint,
  targetRadius,
  otherNodePositions,
  screenEdges,
  width,
  height,
  orderIndex,
) {
  const targetDistance = distancePointToRect(targetPoint, position, width, height);
  // 대상 노드 자체를 가리는 위치는 최우선으로 배제한다.
  let score = targetDistance < targetRadius + 8 ? 100000 : 0;

  // 다른 노드를 가리거나 너무 가까운 후보에는 큰 패널티를 부여한다.
  for (const node of otherNodePositions) {
    const distance = distancePointToRect(node, position, width, height);

    if (distance === 0) {
      score += 12000;
    } else if (distance < 24) {
      score += (24 - distance) * 24;
    }
  }

  // 연결선(간선) 위를 지나가거나 바짝 붙는 후보에는 강한 회피 패널티를 부여한다.
  for (const edge of screenEdges) {
    const edgeDistance = distanceSegmentToRect(edge.from, edge.to, position, width, height);

    if (edgeDistance === 0) {
      score += edge.isConnectedToTarget ? 45000 : 18000;
    } else if (edgeDistance < 16) {
      score += (16 - edgeDistance) * (edge.isConnectedToTarget ? 220 : 75);
    }
  }

  // 조건이 동일하면 대상 노드에서 가장 자연스럽게 가까운 후보를 고른다.
  const centerX = position.x + width / 2;
  const centerY = position.y + height / 2;

  score += Math.hypot(centerX - targetPoint.x, centerY - targetPoint.y) * 0.22;
  score += orderIndex * 1.5;

  return score;
}

/** 한 점에서 사각형 경계까지의 최단 거리를 계산한다. 내부에 있으면 0을 반환한다. */
function distancePointToRect(point, rect, width, height) {
  const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + width));
  const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + height));

  return Math.hypot(dx, dy);
}

/** 선분(간선)과 사각형(미리보기 카드) 사이의 최단 거리를 계산한다. 겹치거나 교차하면 0을 반환한다. */
function distanceSegmentToRect(p1, p2, rect, width, height) {
  const minX = rect.x;
  const maxX = rect.x + width;
  const minY = rect.y;
  const maxY = rect.y + height;

  if (
    (p1.x >= minX && p1.x <= maxX && p1.y >= minY && p1.y <= maxY) ||
    (p2.x >= minX && p2.x <= maxX && p2.y >= minY && p2.y <= maxY)
  ) {
    return 0;
  }

  const corners = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];
  const rectEdges = [
    [corners[0], corners[1]],
    [corners[1], corners[2]],
    [corners[2], corners[3]],
    [corners[3], corners[0]],
  ];

  for (const [edgeStart, edgeEnd] of rectEdges) {
    if (segmentsIntersect(p1, p2, edgeStart, edgeEnd)) {
      return 0;
    }
  }

  let minDistance = Math.min(
    distancePointToRect(p1, rect, width, height),
    distancePointToRect(p2, rect, width, height),
  );

  for (const corner of corners) {
    minDistance = Math.min(minDistance, distancePointToSegment(corner, p1, p2));
  }

  return minDistance;
}

/** 두 선분이 교차하는지 판별한다. */
function segmentsIntersect(a1, a2, b1, b2) {
  const o1 = orientation(a1, a2, b1);
  const o2 = orientation(a1, a2, b2);
  const o3 = orientation(b1, b2, a1);
  const o4 = orientation(b1, b2, a2);

  if (o1 !== o2 && o3 !== o4) {
    return true;
  }

  return (
    (o1 === 0 && pointOnSegment(b1, a1, a2)) ||
    (o2 === 0 && pointOnSegment(b2, a1, a2)) ||
    (o3 === 0 && pointOnSegment(a1, b1, b2)) ||
    (o4 === 0 && pointOnSegment(a2, b1, b2))
  );
}

function orientation(p, q, r) {
  const value = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

  if (Math.abs(value) < 1e-6) {
    return 0;
  }

  return value > 0 ? 1 : 2;
}

function pointOnSegment(p, a, b) {
  return (
    p.x <= Math.max(a.x, b.x) + 1e-6 &&
    p.x >= Math.min(a.x, b.x) - 1e-6 &&
    p.y <= Math.max(a.y, b.y) + 1e-6 &&
    p.y >= Math.min(a.y, b.y) - 1e-6
  );
}

/** 한 점에서 선분까지의 최단 거리를 계산한다. */
function distancePointToSegment(point, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq < 1e-6) {
    return Math.hypot(point.x - a.x, point.y - a.y);
  }

  const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSq, 0, 1);

  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
}

/** 그래프 요청 상태에 맞는 안내 화면의 문구와 동작을 만든다. */
function getGraphState({ activeTab, graphQuery, isLoggedIn, posts }) {
  if (activeTab === 'mine' && !isLoggedIn) {
    return {
      description: '내 게시글 그래프는 로그인 후 확인할 수 있습니다.',
      title: '로그인이 필요합니다',
    };
  }

  if (graphQuery.isPending) {
    return {
      description: '게시글 관계를 불러오는 중입니다.',
      isLoading: true,
      title: '그래프를 준비하고 있습니다',
    };
  }

  if (graphQuery.isFetching) {
    return {
      description: '게시글 관계를 다시 불러오는 중입니다.',
      isLoading: true,
      title: '그래프를 다시 불러오는 중입니다',
    };
  }

  if (graphQuery.isError) {
    return {
      description: graphQuery.error?.message ?? '잠시 후 다시 시도해 주세요.',
      onRetry: () => graphQuery.refetch(),
      title: '그래프를 불러오지 못했습니다',
    };
  }

  if (posts.length === 0) {
    return {
      description: '조회 조건에 맞는 게시글 관계가 아직 없습니다.',
      title: '표시할 그래프가 없습니다',
    };
  }

  return null;
}

/** 그래프의 로딩·오류·빈 상태를 일관된 형태로 표시한다. */
function GraphStatus({ canvasTheme = 'dark', description, isLoading = false, onRetry, title }) {
  const isLight = canvasTheme === 'light';

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      {isLoading ? (
        <LoaderCircle className="size-7 animate-spin text-primary" />
      ) : (
        <HelpCircle className={isLight ? 'size-7 text-amber-800/70' : 'size-7 text-slate-400'} />
      )}
      <div>
        <h2 className={isLight ? 'text-lg font-black text-slate-900' : 'text-lg font-black text-slate-100'}>{title}</h2>
        <p className={isLight ? 'mt-1 text-sm font-bold text-slate-700' : 'mt-1 text-sm font-bold text-slate-400'}>
          {description}
        </p>
      </div>
      {onRetry ? (
        <button
          type="button"
          className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/85"
          onClick={onRetry}
        >
          <RefreshCw className="size-3.5" />
          다시 시도
        </button>
      ) : null}
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { HelpCircle, LoaderCircle, Maximize2, Minus, Plus, RefreshCw, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { GraphCanvas } from '@/components/domain/graph-view/feature/GraphCanvas';
import { FilterSidebar } from '@/components/domain/graph-view/layout/FilterSidebar';
import { GraphToolbar } from '@/components/domain/graph-view/layout/GraphToolbar';
import { PostListPanel } from '@/components/domain/graph-view/layout/PostListPanel';
import { CanvasButton } from '@/components/domain/graph-view/ui/CanvasButton';
import { GraphLegend } from '@/components/domain/graph-view/ui/GraphLegend';
import { NodePopup } from '@/components/domain/graph-view/ui/NodePopup';
import { fetchPostGraph, fetchPostGraphByPostId } from '@/lib/api/graph';
import { toGraphViewData } from '@/lib/graph-view/graph-api-data';
import {
  createPhysicsSimulation,
  isSimulationActive,
  pinSimulationNode,
  releaseSimulationNode,
  resetSimulationLayout,
  snapshotSimulationPositions,
  stepSimulation,
} from '@/lib/graph-view/graph-physics';
import {
  GRAPH_THEME_STORAGE_KEY,
  SVG_H,
  SVG_W,
  clamp,
  getGraphTheme,
  graphNodeRadius,
  toggleSetValue,
} from '@/lib/graph-view/graph-view-utils';
import { postDetailHref } from '@/lib/url/handle';
import { useAuthStore } from '@/store/authStore';

const CAMERA_ANIMATION_MS = 320;
const VIEWPORT_NODE_PADDING = 28;
const LEFT_SIDEBAR_WIDTH = 288;
const RIGHT_PANEL_WIDTH = 352;

/** 사용자가 움직임 최소화 설정을 켰는지 확인한다. */
function prefersReducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
}

/** 캔버스 테마와 현재 확대·이동 상태에 맞는 무한 타일링 CSS 배경 스타일을 만든다. */
function createCanvasBackdropStyle(canvasTheme, pan, zoom) {
  const theme = getGraphTheme(canvasTheme);

  if (canvasTheme === 'light') {
    const gridSpacing = Math.max(14, Math.round(24 * zoom));
    const offsetX = Math.round(pan.x % gridSpacing);
    const offsetY = Math.round(pan.y % gridSpacing);

    return {
      backgroundImage: `radial-gradient(circle, ${theme.dotColor} 1.2px, transparent 1.2px), ${theme.canvasBackground}`,
      backgroundPosition: `${offsetX}px ${offsetY}px, 0 0`,
      backgroundSize: `${gridSpacing}px ${gridSpacing}px, 100% 100%`,
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
 * 서버 그래프 데이터를 조회하고, 실시간 물리 드래그·캔버스 테마·탐색 상호작용을 제공한다.
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
  const [showPanel, setShowPanel] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isCanvasInteracting, setIsCanvasInteracting] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showTagEdges, setShowTagEdges] = useState(true);
  const [showExplicitEdges, setShowExplicitEdges] = useState(false);
  const [minSharedTags, setMinSharedTags] = useState(1);
  const [activeAuthors, setActiveAuthors] = useState(() => new Set());
  const [activeTags, setActiveTags] = useState(() => new Set());
  const [popupPos, setPopupPos] = useState(null);
  const [nodePositions, setNodePositions] = useState(() => ({}));
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const simulationRef = useRef(null);
  const physicsRafRef = useRef(null);
  const cameraRafRef = useRef(null);
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  const panelVisibilityRef = useRef({ showPanel: false, showSidebar: false });
  const resolvedCurrentUserId = currentUserId == null ? null : String(currentUserId);
  const requestedUserId = activeTab === 'mine' ? resolvedCurrentUserId : userId;
  const activeCanvasTheme = getGraphTheme(canvasTheme);

  panRef.current = pan;
  zoomRef.current = zoom;
  panelVisibilityRef.current = { showPanel, showSidebar };

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

  const graphData = useMemo(
    () => toGraphViewData(graphQuery.data, { groupByCategory: activeTab === 'category' }),
    [activeTab, graphQuery.data],
  );
  const { authors, edges, posts, tagCounts } = graphData;
  const hasExplicitEdges = edges.some((edge) => edge.isExplicit);

  /** 현재 화면에 보이는 캔버스 영역을 그래프 좌표계 경계로 변환해 노드가 화면 밖으로 사라지지 않게 제한한다. */
  const getVisibleGraphBounds = useCallback(() => {
    const svg = svgRef.current;

    if (!svg) {
      return null;
    }

    const ctm = svg.getScreenCTM();

    if (!ctm) {
      return null;
    }

    const rect = svg.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
      return null;
    }

    const { showPanel: isPanelOpen, showSidebar: isSidebarOpen } = panelVisibilityRef.current;
    const leftInset = (isSidebarOpen ? LEFT_SIDEBAR_WIDTH : 0) + VIEWPORT_NODE_PADDING;
    const rightInset = (isPanelOpen ? RIGHT_PANEL_WIDTH : 0) + VIEWPORT_NODE_PADDING;
    const minClientX = Math.min(rect.left + leftInset, rect.right - VIEWPORT_NODE_PADDING);
    const maxClientX = Math.max(minClientX, rect.right - rightInset);
    const minClientY = rect.top + VIEWPORT_NODE_PADDING;
    const maxClientY = Math.max(minClientY, rect.bottom - VIEWPORT_NODE_PADDING);
    const inverseCtm = ctm.inverse();
    const topLeft = svg.createSVGPoint();
    const bottomRight = svg.createSVGPoint();

    topLeft.x = minClientX;
    topLeft.y = minClientY;
    bottomRight.x = maxClientX;
    bottomRight.y = maxClientY;

    const svgTopLeft = topLeft.matrixTransform(inverseCtm);
    const svgBottomRight = bottomRight.matrixTransform(inverseCtm);
    const currentPan = panRef.current;
    const currentZoom = zoomRef.current || 1;

    return {
      minX: (svgTopLeft.x - currentPan.x) / currentZoom,
      maxX: (svgBottomRight.x - currentPan.x) / currentZoom,
      minY: (svgTopLeft.y - currentPan.y) / currentZoom,
      maxY: (svgBottomRight.y - currentPan.y) / currentZoom,
    };
  }, []);

  /** 진행 중인 물리 시뮬레이션 루프를 중지한다. */
  const stopPhysicsLoop = useCallback(() => {
    if (physicsRafRef.current != null) {
      cancelAnimationFrame(physicsRafRef.current);
      physicsRafRef.current = null;
    }
  }, []);

  /** 물리 시뮬레이션이 안정화될 때까지 requestAnimationFrame으로 좌표를 갱신한다. */
  const startPhysicsLoop = useCallback(() => {
    if (physicsRafRef.current != null || !simulationRef.current) {
      return;
    }

    const tick = () => {
      const simulation = simulationRef.current;

      if (!simulation) {
        physicsRafRef.current = null;
        return;
      }

      const changed = stepSimulation(simulation, getVisibleGraphBounds());

      if (changed) {
        setNodePositions(snapshotSimulationPositions(simulation));
      }

      if (isSimulationActive(simulation)) {
        physicsRafRef.current = requestAnimationFrame(tick);
      } else {
        physicsRafRef.current = null;
      }
    };

    physicsRafRef.current = requestAnimationFrame(tick);
  }, [getVisibleGraphBounds]);

  /** 진행 중인 카메라 포커스 이동 애니메이션을 중단한다. */
  const cancelCameraAnimation = useCallback(() => {
    if (cameraRafRef.current != null) {
      cancelAnimationFrame(cameraRafRef.current);
      cameraRafRef.current = null;
    }
  }, []);

  // 데이터나 탭이 바뀔 때마다 물리 시뮬레이션을 초기화하고 소규모 그래프에서만 초기 전개 애니메이션을 실행한다.
  useEffect(() => {
    stopPhysicsLoop();

    if (posts.length === 0) {
      simulationRef.current = null;
      setNodePositions({});
      return undefined;
    }

    const simulation = createPhysicsSimulation(posts, edges, {
      animateEntry: !prefersReducedMotion(),
      groupByCategory: activeTab === 'category',
    });

    simulationRef.current = simulation;
    setNodePositions(snapshotSimulationPositions(simulation));

    if (isSimulationActive(simulation)) {
      startPhysicsLoop();
    }

    return stopPhysicsLoop;
  }, [activeTab, edges, posts, startPhysicsLoop, stopPhysicsLoop]);

  useEffect(() => cancelCameraAnimation, [cancelCameraAnimation]);

  useEffect(() => {
    setActiveAuthors(new Set(authors.map((author) => author.id)));
    setActiveTags(new Set(tagCounts.map(([tag]) => tag)));
    setSelectedId((previousId) => (posts.some((post) => post.id === previousId) ? previousId : null));
  }, [authors, posts, tagCounts]);

  const positionedPosts = useMemo(
    () =>
      posts.map((post) => {
        const livePosition = nodePositions[post.id];

        return livePosition ? { ...post, x: livePosition.x, y: livePosition.y } : post;
      }),
    [nodePositions, posts],
  );
  const positionedPostsRef = useRef(positionedPosts);

  positionedPostsRef.current = positionedPosts;

  const visiblePosts = useMemo(
    () =>
      positionedPosts.filter(
        (post) =>
          activeAuthors.has(post.author.id) && (post.tags.length === 0 || post.tags.some((tag) => activeTags.has(tag))),
      ),
    [activeAuthors, activeTags, positionedPosts],
  );
  const visiblePostIds = useMemo(() => new Set(visiblePosts.map((post) => post.id)), [visiblePosts]);
  const visibleEdges = useMemo(
    () => edges.filter((edge) => visiblePostIds.has(edge.from) && visiblePostIds.has(edge.to)),
    [edges, visiblePostIds],
  );
  const displayedEdges = useMemo(
    () =>
      visibleEdges.filter(
        (edge) =>
          (edge.isExplicit && showExplicitEdges) ||
          (!edge.isExplicit && showTagEdges && edge.strength >= minSharedTags),
      ),
    [minSharedTags, showExplicitEdges, showTagEdges, visibleEdges],
  );
  const displayedEdgeCount = displayedEdges.length;
  const displayedConnectionCountById = useMemo(() => {
    const counts = new Map();

    displayedEdges.forEach((edge) => {
      counts.set(edge.from, (counts.get(edge.from) ?? 0) + 1);
      counts.set(edge.to, (counts.get(edge.to) ?? 0) + 1);
    });

    return counts;
  }, [displayedEdges]);
  const popupPost = useMemo(
    () => visiblePosts.find((post) => post.id === (hoveredId ?? selectedId)) ?? null,
    [hoveredId, selectedId, visiblePosts],
  );
  const popupConnectionCount = popupPost ? (displayedConnectionCountById.get(popupPost.id) ?? 0) : 0;

  // 목록 패널은 좌표 프레임 변경과 무관하므로 필터 기준 목록만 별도로 메모이제이션해 드래그 중 리렌더를 막는다.
  const panelPosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          activeAuthors.has(post.author.id) && (post.tags.length === 0 || post.tags.some((tag) => activeTags.has(tag))),
      ),
    [activeAuthors, activeTags, posts],
  );
  const filterStats = useMemo(
    () => ({
      posts: panelPosts.length,
      edges: displayedEdgeCount,
      activeTags: activeTags.size,
      authors: activeAuthors.size,
    }),
    [activeAuthors.size, activeTags.size, displayedEdgeCount, panelPosts.length],
  );

  // 호버·선택된 노드 근처에서 다른 노드를 가장 적게 가리는 팝업 좌표를 계산한다.
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

      const targetScreenPoint = projectNode(popupPost);
      const otherNodePositions = visiblePosts.filter((item) => item.id !== popupPost.id).map(projectNode);
      const nodeRadius = graphNodeRadius(displayedConnectionCountById.get(popupPost.id) ?? 0);
      const scaleFactor = Math.hypot(ctm.a, ctm.b) || 1;
      const targetScreenRadius = nodeRadius * zoom * scaleFactor;
      const insets = {
        left: showSidebar ? LEFT_SIDEBAR_WIDTH : 0,
        right: showPanel ? RIGHT_PANEL_WIDTH : 0,
      };

      setPopupPos(
        findNearbyPopupPosition(containerRect, targetScreenPoint, targetScreenRadius, otherNodePositions, insets),
      );
    };

    updatePopupPosition();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(updatePopupPosition);

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [displayedConnectionCountById, isCanvasInteracting, pan, popupPost, showPanel, showSidebar, visiblePosts, zoom]);

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

  /** 노드를 드래그하기 시작할 때 해당 노드를 포인터에 고정하고 물리 연산을 시작한다. */
  const handleNodeDragStart = useCallback(
    (nodeId, graphX, graphY) => {
      const simulation = simulationRef.current;

      if (!simulation) {
        return;
      }

      pinSimulationNode(simulation, nodeId, graphX, graphY);
      setNodePositions(snapshotSimulationPositions(simulation));
      startPhysicsLoop();
    },
    [startPhysicsLoop],
  );

  /** 노드를 드래그하는 동안 포인터 좌표로 고정 위치를 갱신한다. */
  const handleNodeDragMove = useCallback(
    (nodeId, graphX, graphY) => {
      const simulation = simulationRef.current;

      if (!simulation) {
        return;
      }

      pinSimulationNode(simulation, nodeId, graphX, graphY);
      setNodePositions(snapshotSimulationPositions(simulation));
      startPhysicsLoop();
    },
    [startPhysicsLoop],
  );

  /** 노드 드래그가 끝나면 고정을 풀어 물리 균형에 맞게 안착시킨다. */
  const handleNodeDragEnd = useCallback(() => {
    const simulation = simulationRef.current;

    if (!simulation) {
      return;
    }

    releaseSimulationNode(simulation);
    startPhysicsLoop();
  }, [startPhysicsLoop]);

  /** 모든 노드를 초기 균형 배치로 되돌린다. */
  const handleResetLayout = useCallback(() => {
    const simulation = simulationRef.current;

    if (!simulation) {
      return;
    }

    const shouldAnimate = !prefersReducedMotion();

    resetSimulationLayout(simulation, { animate: shouldAnimate });
    setNodePositions(snapshotSimulationPositions(simulation));

    if (shouldAnimate) {
      startPhysicsLoop();
    }
  }, [startPhysicsLoop]);

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

  /** 작성자 필터를 반전한다. */
  const toggleAuthor = useCallback((id) => {
    setActiveAuthors((previous) => toggleSetValue(previous, id));
  }, []);

  /** 모든 작성자를 선택한다. */
  const selectAllAuthors = useCallback(() => {
    setActiveAuthors(new Set(authors.map((author) => author.id)));
  }, [authors]);

  /** 모든 작성자 선택을 해제한다. */
  const clearAllAuthors = useCallback(() => {
    setActiveAuthors(new Set());
  }, []);

  /** 키워드 필터를 반전한다. */
  const toggleTag = useCallback((tag) => {
    setActiveTags((previous) => toggleSetValue(previous, tag));
  }, []);

  /** 모든 태그를 선택한다. */
  const selectAllTags = useCallback(() => {
    setActiveTags(new Set(tagCounts.map(([tag]) => tag)));
  }, [tagCounts]);

  /** 모든 태그 선택을 해제한다. */
  const clearAllTags = useCallback(() => {
    setActiveTags(new Set());
  }, []);

  /** API 응답 기준의 모든 필터를 기본값으로 되돌린다. */
  const resetFilters = useCallback(() => {
    setShowTagEdges(true);
    setShowExplicitEdges(false);
    setMinSharedTags(1);
    setActiveAuthors(new Set(authors.map((author) => author.id)));
    setActiveTags(new Set(tagCounts.map(([tag]) => tag)));
  }, [authors, tagCounts]);

  /** 노드를 선택하고 해당 노드 위치로 카메라를 포커스한다. */
  const handleSelect = useCallback(
    (id) => {
      setSelectedId(id);

      if (id) {
        setShowPanel(true);
        focusNodeInViewport(id);
      }
    },
    [focusNodeInViewport],
  );

  /** 클릭한 노드의 게시글 상세 화면으로 이동한다. */
  const handleOpenPost = useCallback(
    (id) => {
      const post = posts.find((item) => item.id === id);

      if (post) {
        router.push(postDetailHref(post.author.id, post.id));
      }
    },
    [posts, router],
  );

  const graphState = getGraphState({ activeTab, graphQuery, isLoggedIn, posts });
  const canvasBackdropStyle = useMemo(
    () => createCanvasBackdropStyle(canvasTheme, pan, zoom),
    [canvasTheme, pan, zoom],
  );
  const leftControlsOffset = showSidebar ? 'left-[19rem]' : 'left-4';
  const rightControlsOffset = showPanel ? 'right-[23rem]' : 'right-4';

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
        setShowPanel={setShowPanel}
        setShowSidebar={setShowSidebar}
        showPanel={showPanel}
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
              canvasTheme={canvasTheme}
              currentUserId={resolvedCurrentUserId}
              edges={visibleEdges}
              hoveredId={hoveredId}
              minSharedTags={minSharedTags}
              onHover={setHoveredId}
              onInteractionChange={setIsCanvasInteracting}
              onManualViewportChange={cancelCameraAnimation}
              onNodeDragEnd={handleNodeDragEnd}
              onNodeDragMove={handleNodeDragMove}
              onNodeDragStart={handleNodeDragStart}
              onOpenPost={handleOpenPost}
              pan={pan}
              posts={visiblePosts}
              selectedId={selectedId}
              setPan={setPan}
              setZoom={setZoom}
              showExplicitEdges={showExplicitEdges}
              showPanel={showPanel}
              showSidebar={showSidebar}
              showTagEdges={showTagEdges}
              svgRef={svgRef}
              zoom={zoom}
            />

            {showLegend ? <GraphLegend canvasTheme={canvasTheme} offsetLeftClass={leftControlsOffset} /> : null}

            <div
              className={`absolute ${rightControlsOffset} bottom-6 z-20 flex flex-col gap-1.5 transition-[right] duration-200`}
            >
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
                label="배치 재정렬"
                onClick={() => {
                  cancelCameraAnimation();
                  handleResetLayout();
                }}
              >
                <RotateCcw className="size-3.5" />
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
              activeAuthors={activeAuthors}
              activeTags={activeTags}
              authors={authors}
              clearAllAuthors={clearAllAuthors}
              clearAllTags={clearAllTags}
              hasExplicitEdges={hasExplicitEdges}
              minSharedTags={minSharedTags}
              resetFilters={resetFilters}
              selectAllAuthors={selectAllAuthors}
              selectAllTags={selectAllTags}
              setMinSharedTags={setMinSharedTags}
              setShowExplicitEdges={setShowExplicitEdges}
              setShowTagEdges={setShowTagEdges}
              showAuthorFilter={!userId && activeTab !== 'mine'}
              showExplicitEdges={showExplicitEdges}
              showTagEdges={showTagEdges}
              stats={filterStats}
              tagCounts={tagCounts}
              toggleAuthor={toggleAuthor}
              toggleTag={toggleTag}
            />
          ) : null}

          {showPanel ? <PostListPanel onSelect={handleSelect} posts={panelPosts} selectedId={selectedId} /> : null}
        </div>
      )}
    </div>
  );
}

/**
 * 대상 노드 주변(우·좌·하·상 및 대각선) 후보 중 화면 경계 안에서 다른 노드를 가장 적게 가리는 위치를 찾는다.
 */
function findNearbyPopupPosition(
  containerRect,
  targetPoint,
  targetRadius,
  otherNodePositions,
  insets = { left: 0, right: 0 },
) {
  const margin = 12;
  const leftBound = insets.left + margin;
  const rightBound = Math.max(leftBound, containerRect.width - insets.right - margin);
  const availableWidth = Math.max(0, rightBound - leftBound);
  const popupWidth = Math.min(256, availableWidth);
  const popupHeight = Math.min(188, Math.max(0, containerRect.height - margin * 2));
  const maxX = Math.max(leftBound, rightBound - popupWidth);
  const maxY = Math.max(margin, containerRect.height - popupHeight - margin);
  const gap = Math.max(22, targetRadius + 16);
  const diagonalGap = gap * 0.8;

  const rawCandidates = [
    { x: targetPoint.x + gap, y: targetPoint.y - popupHeight / 2 },
    { x: targetPoint.x - gap - popupWidth, y: targetPoint.y - popupHeight / 2 },
    { x: targetPoint.x - popupWidth / 2, y: targetPoint.y + gap },
    { x: targetPoint.x - popupWidth / 2, y: targetPoint.y - gap - popupHeight },
    { x: targetPoint.x + diagonalGap, y: targetPoint.y + diagonalGap },
    { x: targetPoint.x - diagonalGap - popupWidth, y: targetPoint.y + diagonalGap },
    { x: targetPoint.x + diagonalGap, y: targetPoint.y - diagonalGap - popupHeight },
    { x: targetPoint.x - diagonalGap - popupWidth, y: targetPoint.y - diagonalGap - popupHeight },
  ];

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

/** 대상 노드와의 근접성, 대상 노드 가림 방지와 주변 노드 간섭 최소화를 함께 점수화한다. */
function calculateNearbyPopupScore(position, targetPoint, targetRadius, otherNodePositions, width, height, orderIndex) {
  const targetDistance = distancePointToRect(targetPoint, position, width, height);
  // 대상 노드 자체를 가리는 위치는 최우선으로 배제한다.
  let score = targetDistance < targetRadius + 8 ? 100000 : 0;

  // 다른 노드를 가리거나 너무 가까운 후보에는 큰 패널티를 부여한다.
  for (const node of otherNodePositions) {
    const distance = distancePointToRect(node, position, width, height);

    if (distance === 0) {
      score += 10000;
    } else if (distance < 26) {
      score += (26 - distance) * 20;
    }
  }

  // 노드 중심에서 가까울수록 자연스럽게 연결되어 보이므로 거리에 비례한 약한 가중치를 더한다.
  const centerX = position.x + width / 2;
  const centerY = position.y + height / 2;

  score += Math.hypot(centerX - targetPoint.x, centerY - targetPoint.y) * 0.25;
  score += orderIndex * 2;

  return score;
}

/** 한 점에서 사각형 경계까지의 최단 거리를 계산한다. 내부에 있으면 0을 반환한다. */
function distancePointToRect(point, rect, width, height) {
  const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + width));
  const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + height));

  return Math.hypot(dx, dy);
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
        <HelpCircle className={isLight ? 'size-7 text-slate-500' : 'size-7 text-slate-400'} />
      )}
      <div>
        <h2 className={isLight ? 'text-lg font-black text-slate-900' : 'text-lg font-black text-slate-100'}>{title}</h2>
        <p className={isLight ? 'mt-1 text-sm font-bold text-slate-600' : 'mt-1 text-sm font-bold text-slate-400'}>
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

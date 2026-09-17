'use client';

import { useQuery } from '@tanstack/react-query';
import { HelpCircle, LoaderCircle, Maximize2, Minus, Plus, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { GraphCanvas } from '@/components/domain/graph-view/feature/GraphCanvas';
import { FilterSidebar } from '@/components/domain/graph-view/layout/FilterSidebar';
import { GraphToolbar } from '@/components/domain/graph-view/layout/GraphToolbar';
import { PostListPanel } from '@/components/domain/graph-view/layout/PostListPanel';
import { toGraphViewData } from '@/components/domain/graph-view/lib/graph-api-data';
import { CANVAS_BG, clamp, toggleSetValue } from '@/components/domain/graph-view/lib/graph-view-utils';
import { CanvasButton } from '@/components/domain/graph-view/ui/CanvasButton';
import { GraphLegend } from '@/components/domain/graph-view/ui/GraphLegend';
import { NodePopup } from '@/components/domain/graph-view/ui/NodePopup';
import { fetchPostGraph, fetchPostGraphByPostId } from '@/lib/api/graph';
import { postDetailHref } from '@/lib/url/handle';
import { useAuthStore } from '@/store/authStore';

/**
 * 서버 그래프 데이터를 조회하고, 기존 그래프 화면의 탐색·필터 상호작용을 제공한다.
 *
 * @param {{ categoryId?: number, loadGraph?: Function, minScore?: number, postId?: number, userId?: string }} props URL 조회 조건
 */
export default function GraphViewPage({ categoryId, loadGraph, minScore, postId, userId }) {
  const router = useRouter();
  const currentUserId = useAuthStore((state) => state.user?.userId);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [activeTab, setActiveTab] = useState('all');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showTagEdges, setShowTagEdges] = useState(true);
  const [showExplicitEdges, setShowExplicitEdges] = useState(false);
  const [minSharedTags, setMinSharedTags] = useState(1);
  const [activeAuthors, setActiveAuthors] = useState(() => new Set());
  const [activeTags, setActiveTags] = useState(() => new Set());
  const [popupPos, setPopupPos] = useState(null);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const resolvedCurrentUserId = currentUserId == null ? null : String(currentUserId);
  const requestedUserId = activeTab === 'mine' ? resolvedCurrentUserId : userId;

  const graphQuery = useQuery({
    queryKey: ['post-graph', { categoryId, minScore, postId, userId: requestedUserId }],
    queryFn: () => {
      const query = { categoryId, minScore, postId, userId: requestedUserId };

      if (loadGraph) {
        return loadGraph(query);
      }

      if (requestedUserId) {
        return fetchPostGraph({ categoryId, minScore, userId: requestedUserId });
      }

      return postId != null ? fetchPostGraphByPostId(postId, { minScore }) : fetchPostGraph({ categoryId, minScore });
    },
    enabled: activeTab !== 'mine' || Boolean(resolvedCurrentUserId),
  });
  const graphData = useMemo(() => toGraphViewData(graphQuery.data), [graphQuery.data]);
  const { authors, edges, posts, tagCounts } = graphData;
  const hasExplicitEdges = edges.some((edge) => edge.isExplicit);

  useEffect(() => {
    setActiveAuthors(new Set(authors.map((author) => author.id)));
    setActiveTags(new Set(tagCounts.map(([tag]) => tag)));
    setSelectedId((previousId) => (posts.some((post) => post.id === previousId) ? previousId : null));
  }, [authors, posts, tagCounts]);

  const visiblePosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          activeAuthors.has(post.author.id) && (post.tags.length === 0 || post.tags.some((tag) => activeTags.has(tag))),
      ),
    [activeAuthors, activeTags, posts],
  );
  const visiblePostIds = useMemo(() => new Set(visiblePosts.map((post) => post.id)), [visiblePosts]);
  const visibleEdges = useMemo(
    () => edges.filter((edge) => visiblePostIds.has(edge.from) && visiblePostIds.has(edge.to)),
    [edges, visiblePostIds],
  );
  const displayedEdgeCount = useMemo(
    () =>
      visibleEdges.filter(
        (edge) =>
          (edge.isExplicit && showExplicitEdges) ||
          (!edge.isExplicit && showTagEdges && edge.strength >= minSharedTags),
      ).length,
    [minSharedTags, showExplicitEdges, showTagEdges, visibleEdges],
  );
  const popupPost = useMemo(
    () => posts.find((post) => post.id === (selectedId ?? hoveredId)) ?? null,
    [hoveredId, posts, selectedId],
  );

  useEffect(() => {
    const popupPostId = selectedId ?? hoveredId;

    if (!popupPostId || !svgRef.current || !containerRef.current) {
      setPopupPos(null);
      return;
    }

    const post = posts.find((item) => item.id === popupPostId);

    if (!post) {
      setPopupPos(null);
      return;
    }

    const ctm = svgRef.current.getScreenCTM();

    if (!ctm) {
      return;
    }

    const point = svgRef.current.createSVGPoint();
    point.x = post.x * zoom + pan.x;
    point.y = (post.y + post.radius + 8) * zoom + pan.y;
    const screenPoint = point.matrixTransform(ctm);
    const containerRect = containerRef.current.getBoundingClientRect();
    const popupWidth = 288;
    const popupHeight = 330;
    setPopupPos({
      x: clamp(
        screenPoint.x - containerRect.left,
        popupWidth / 2 + 12,
        Math.max(popupWidth / 2 + 12, containerRect.width - popupWidth / 2 - 12),
      ),
      y: clamp(screenPoint.y - containerRect.top, 12, Math.max(12, containerRect.height - popupHeight)),
    });
  }, [hoveredId, pan, posts, selectedId, showPanel, showSidebar, zoom]);

  /** 작성자 필터를 반전한다. */
  function toggleAuthor(id) {
    setActiveAuthors((previous) => toggleSetValue(previous, id));
  }

  /** 키워드 필터를 반전한다. */
  function toggleTag(tag) {
    setActiveTags((previous) => toggleSetValue(previous, tag));
  }

  /** API 응답 기준의 모든 필터를 기본값으로 되돌린다. */
  function resetFilters() {
    setShowTagEdges(true);
    setShowExplicitEdges(false);
    setMinSharedTags(1);
    setActiveAuthors(new Set(authors.map((author) => author.id)));
    setActiveTags(new Set(tagCounts.map(([tag]) => tag)));
  }

  /** 노드를 선택하고 목록 패널을 연다. */
  function handleSelect(id) {
    setSelectedId(id);
    if (id) {
      setShowPanel(true);
    }
  }

  /** 클릭한 노드의 게시글 상세 화면으로 이동한다. */
  function handleOpenPost(id) {
    const post = posts.find((item) => item.id === id);

    if (post) {
      router.push(postDetailHref(post.author.id, post.id));
    }
  }

  const graphState = getGraphState({ activeTab, graphQuery, isLoggedIn, posts });

  return (
    <div
      className="flex h-[calc(100vh-105px)] min-h-[680px] flex-col overflow-hidden border-t border-border text-foreground"
      style={{ background: CANVAS_BG }}
    >
      <GraphToolbar
        activeTab={activeTab}
        isLoggedIn={isLoggedIn}
        setActiveTab={setActiveTab}
        setShowPanel={setShowPanel}
        setShowSidebar={setShowSidebar}
        showPanel={showPanel}
        showSidebar={showSidebar}
      />

      {graphState ? (
        <GraphStatus {...graphState} />
      ) : (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {showSidebar ? (
            <FilterSidebar
              activeAuthors={activeAuthors}
              activeTags={activeTags}
              authors={authors}
              hasExplicitEdges={hasExplicitEdges}
              minSharedTags={minSharedTags}
              resetFilters={resetFilters}
              setMinSharedTags={setMinSharedTags}
              setShowExplicitEdges={setShowExplicitEdges}
              setShowTagEdges={setShowTagEdges}
              showExplicitEdges={showExplicitEdges}
              showTagEdges={showTagEdges}
              stats={{
                posts: visiblePosts.length,
                edges: displayedEdgeCount,
                activeTags: activeTags.size,
                authors: activeAuthors.size,
              }}
              tagCounts={tagCounts}
              toggleAuthor={toggleAuthor}
              toggleTag={toggleTag}
            />
          ) : null}

          <main ref={containerRef} className="relative min-w-0 flex-1 overflow-hidden">
            <GraphCanvas
              activeTab={activeTab}
              currentUserId={resolvedCurrentUserId}
              edges={visibleEdges}
              hoveredId={hoveredId}
              minSharedTags={minSharedTags}
              onHover={setHoveredId}
              onOpenPost={handleOpenPost}
              pan={pan}
              posts={visiblePosts}
              selectedId={selectedId}
              setPan={setPan}
              showExplicitEdges={showExplicitEdges}
              showTagEdges={showTagEdges}
              svgRef={svgRef}
              zoom={zoom}
            />

            {showLegend ? <GraphLegend /> : null}

            <div className="absolute right-4 bottom-6 flex flex-col gap-1.5">
              <CanvasButton label="확대" onClick={() => setZoom((value) => Math.min(value + 0.15, 2.5))}>
                <Plus className="size-4" />
              </CanvasButton>
              <CanvasButton label="축소" onClick={() => setZoom((value) => Math.max(value - 0.15, 0.45))}>
                <Minus className="size-4" />
              </CanvasButton>
              <CanvasButton
                label="맞춤"
                onClick={() => {
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
              className="absolute bottom-6 left-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors hover:bg-muted hover:text-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground"
              onClick={() => setShowLegend((value) => !value)}
            >
              <HelpCircle className="size-4" />
            </button>

            {popupPost && popupPos ? <NodePopup position={popupPos} post={popupPost} /> : null}
          </main>

          {showPanel ? <PostListPanel onSelect={handleSelect} posts={visiblePosts} selectedId={selectedId} /> : null}
        </div>
      )}
    </div>
  );
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
function GraphStatus({ description, isLoading = false, onRetry, title }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      {isLoading ? (
        <LoaderCircle className="size-7 animate-spin text-primary" />
      ) : (
        <HelpCircle className="size-7 text-muted-foreground" />
      )}
      <div>
        <h2 className="text-lg font-black text-foreground">{title}</h2>
        <p className="mt-1 text-sm font-bold text-muted-foreground">{description}</p>
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

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HelpCircle, Maximize2, Minus, Plus } from "lucide-react";

import { GraphCanvas } from "@/components/domain/graph-view/feature/GraphCanvas";
import { FilterSidebar } from "@/components/domain/graph-view/layout/FilterSidebar";
import { GraphToolbar } from "@/components/domain/graph-view/layout/GraphToolbar";
import { PostListPanel } from "@/components/domain/graph-view/layout/PostListPanel";
import {
  CANVAS_BG,
  clamp,
  createEdges,
  createPosts,
  toggleSetValue,
} from "@/components/domain/graph-view/lib/graph-view-utils";
import { CanvasButton } from "@/components/domain/graph-view/ui/CanvasButton";
import { GraphLegend } from "@/components/domain/graph-view/ui/GraphLegend";
import { NodePopup } from "@/components/domain/graph-view/ui/NodePopup";
import { graphViewUiMockData } from "@/data/graph-view/graph-view-ui-mock-data";

export default function GraphViewPage() {
  const data = graphViewUiMockData;
  const authors = useMemo(
    () =>
      data.authors.map((author) => ({
        ...author,
        name: author.name.replace(" (나)", ""),
      })),
    [data.authors]
  );
  const posts = useMemo(() => createPosts(data, authors), [data, authors]);
  const edges = useMemo(() => createEdges(data), [data]);
  const tagCounts = useMemo(
    () => data.tags.map((tag) => [tag.label, tag.count]),
    [data.tags]
  );

  const [activeTab, setActiveTab] = useState("탐색");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showTagEdges, setShowTagEdges] = useState(true);
  const [showExplicitEdges, setShowExplicitEdges] = useState(true);
  const [minSharedTags, setMinSharedTags] = useState(1);
  const [activeAuthors, setActiveAuthors] = useState(
    () => new Set(authors.map((author) => author.name))
  );
  const [activeTags, setActiveTags] = useState(
    () => new Set(tagCounts.map(([tag]) => tag))
  );
  const [popupPos, setPopupPos] = useState(null);

  const svgRef = useRef(null);
  const containerRef = useRef(null);

  const visiblePosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          activeAuthors.has(post.author.name) &&
          post.tags.some((tag) => activeTags.has(tag))
      ),
    [activeAuthors, activeTags, posts]
  );

  const visiblePostIds = useMemo(
    () => new Set(visiblePosts.map((post) => post.id)),
    [visiblePosts]
  );

  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (edge) => visiblePostIds.has(edge.from) && visiblePostIds.has(edge.to)
      ),
    [edges, visiblePostIds]
  );

  const popupPost = useMemo(
    () => posts.find((post) => post.id === (selectedId ?? hoveredId)) ?? null,
    [hoveredId, posts, selectedId]
  );

  useEffect(() => {
    const postId = selectedId ?? hoveredId;

    if (!postId || !svgRef.current || !containerRef.current) {
      setPopupPos(null);
      return;
    }

    const post = posts.find((item) => item.id === postId);

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
        Math.max(popupWidth / 2 + 12, containerRect.width - popupWidth / 2 - 12)
      ),
      y: clamp(
        screenPoint.y - containerRect.top,
        12,
        Math.max(12, containerRect.height - popupHeight)
      ),
    });
  }, [hoveredId, pan, posts, selectedId, zoom, showSidebar, showPanel]);

  const toggleAuthor = (name) => {
    setActiveAuthors((previous) => toggleSetValue(previous, name));
  };

  const toggleTag = (tag) => {
    setActiveTags((previous) => toggleSetValue(previous, tag));
  };

  const resetFilters = () => {
    setShowTagEdges(true);
    setShowExplicitEdges(true);
    setMinSharedTags(1);
    setActiveAuthors(new Set(authors.map((author) => author.name)));
    setActiveTags(new Set(tagCounts.map(([tag]) => tag)));
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    if (id) {
      setShowPanel(true);
    }
  };

  return (
    <div
      className="flex h-[calc(100vh-105px)] min-h-[680px] flex-col overflow-hidden border-t border-border text-foreground"
      style={{ background: CANVAS_BG }}
    >
      <GraphToolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setShowPanel={setShowPanel}
        setShowSidebar={setShowSidebar}
        showPanel={showPanel}
        showSidebar={showSidebar}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {showSidebar ? (
          <FilterSidebar
            activeAuthors={activeAuthors}
            activeTags={activeTags}
            authors={authors}
            minSharedTags={minSharedTags}
            resetFilters={resetFilters}
            setMinSharedTags={setMinSharedTags}
            setShowExplicitEdges={setShowExplicitEdges}
            setShowTagEdges={setShowTagEdges}
            showExplicitEdges={showExplicitEdges}
            showTagEdges={showTagEdges}
            stats={{
              posts: visiblePosts.length,
              edges: visibleEdges.length,
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
            edges={visibleEdges}
            hoveredId={hoveredId}
            minSharedTags={minSharedTags}
            onHover={setHoveredId}
            onSelect={handleSelect}
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

          <div className="absolute bottom-6 right-4 flex flex-col gap-1.5">
            <CanvasButton
              label="확대"
              onClick={() => setZoom((value) => Math.min(value + 0.15, 2.5))}
            >
              <Plus className="size-4" />
            </CanvasButton>
            <CanvasButton
              label="축소"
              onClick={() => setZoom((value) => Math.max(value - 0.15, 0.45))}
            >
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
            aria-label="도움말"
            aria-pressed={showLegend}
            className="absolute bottom-6 left-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors hover:bg-muted hover:text-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            onClick={() => setShowLegend((value) => !value)}
          >
            <HelpCircle className="size-4" />
          </button>

          {popupPost && popupPos ? (
            <NodePopup position={popupPos} post={popupPost} />
          ) : null}
        </main>

        {showPanel ? (
          <PostListPanel
            onSelect={handleSelect}
            posts={visiblePosts}
            selectedId={selectedId}
          />
        ) : null}
      </div>
    </div>
  );
}

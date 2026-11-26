'use client';

import { useMemo, useRef, useState } from 'react';

import { EdgeKeywordTooltip } from '@/components/domain/graph-view/ui/EdgeKeywordTooltip';
import { LockBadge } from '@/components/domain/graph-view/ui/GraphViewIcons';
import {
  ARROW_LENGTH,
  PRIMARY_SOFT,
  SVG_H,
  SVG_W,
  clamp,
  createArrowPoints,
  edgeBaseOpacity,
  edgeWidth,
  getClusterColor,
  getGraphTheme,
  graphNodeRadius,
  splitNodeTitle,
} from '@/lib/graph-view/graph-view-utils';

const NODE_DRAG_THRESHOLD = 4;
const MAX_EDGE_TOOLTIPS = 4;
const MIN_TOOLTIP_DISTANCE = 72;

/** 결정론적 시드로 밤하늘 배경 별 좌표를 생성한다. */
const BACKGROUND_STARS = Array.from({ length: 90 }, (_, index) => {
  const seedA = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  const seedB = Math.sin(index * 93.9898 + 19.133) * 24634.6345;
  const seedC = Math.sin(index * 45.164 + 11.73) * 19283.412;
  const rx = seedA - Math.floor(seedA);
  const ry = seedB - Math.floor(seedB);
  const rz = seedC - Math.floor(seedC);

  return {
    x: Math.round(-420 + rx * (SVG_W + 840)),
    y: Math.round(-160 + ry * (SVG_H + 320)),
    r: 0.6 + rz * 1.1,
    opacity: 0.22 + (index % 5) * 0.14,
  };
});

/** 노드·간선 SVG와 확대, 이동, 노드 드래그, 키워드 툴팁 상호작용을 렌더링한다. */
export function GraphCanvas({
  activeTab,
  canvasTheme = 'dark',
  currentUserId,
  edges,
  hoveredId,
  minSharedTags,
  onHover,
  onInteractionChange,
  onManualViewportChange,
  onNodeDragEnd,
  onNodeDragMove,
  onNodeDragStart,
  onOpenPost,
  pan,
  posts,
  selectedId,
  setPan,
  setZoom,
  showExplicitEdges,
  showTagEdges,
  svgRef,
  zoom,
}) {
  const dragRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);
  const theme = getGraphTheme(canvasTheme);
  const isLight = canvasTheme === 'light';

  const postMap = useMemo(() => new Map(posts.map((post) => [post.id, post])), [posts]);
  const visibleEdges = useMemo(
    () =>
      edges.filter((edge) => {
        if (edge.isExplicit) {
          return showExplicitEdges;
        }

        if (!showTagEdges) {
          return false;
        }

        return edge.strength >= minSharedTags;
      }),
    [edges, minSharedTags, showExplicitEdges, showTagEdges],
  );
  const filteredPosts = useMemo(
    () => (activeTab === 'mine' ? posts.filter((post) => post.author.id === currentUserId) : posts),
    [activeTab, currentUserId, posts],
  );
  const filteredPostIds = useMemo(() => new Set(filteredPosts.map((post) => post.id)), [filteredPosts]);
  const renderedEdges = useMemo(
    () =>
      visibleEdges.filter(
        (edge) =>
          postMap.has(edge.from) &&
          postMap.has(edge.to) &&
          filteredPostIds.has(edge.from) &&
          filteredPostIds.has(edge.to),
      ),
    [filteredPostIds, postMap, visibleEdges],
  );
  const connectionCountById = useMemo(() => {
    const counts = new Map(filteredPosts.map((post) => [post.id, 0]));

    renderedEdges.forEach((edge) => {
      counts.set(edge.from, (counts.get(edge.from) ?? 0) + 1);
      counts.set(edge.to, (counts.get(edge.to) ?? 0) + 1);
    });

    return counts;
  }, [filteredPosts, renderedEdges]);
  const focusedNodeIds = useMemo(() => {
    const ids = new Set([hoveredId, selectedId, draggingNodeId].filter((id) => id && filteredPostIds.has(id)));

    if (hoveredEdgeId) {
      const hoveredEdge = renderedEdges.find((edge) => edge.id === hoveredEdgeId);

      if (hoveredEdge) {
        ids.add(hoveredEdge.from);
        ids.add(hoveredEdge.to);
      }
    }

    return ids;
  }, [draggingNodeId, filteredPostIds, hoveredEdgeId, hoveredId, renderedEdges, selectedId]);
  const focusedEdges = useMemo(
    () =>
      renderedEdges.filter(
        (edge) => edge.id === hoveredEdgeId || focusedNodeIds.has(edge.from) || focusedNodeIds.has(edge.to),
      ),
    [focusedNodeIds, hoveredEdgeId, renderedEdges],
  );
  const relatedNodeIds = useMemo(() => {
    const relatedIds = new Set(focusedNodeIds);

    focusedEdges.forEach((edge) => {
      relatedIds.add(edge.from);
      relatedIds.add(edge.to);
    });

    return relatedIds;
  }, [focusedEdges, focusedNodeIds]);
  const categoryClusters = useMemo(() => {
    if (activeTab !== 'category') {
      return [];
    }

    const groups = new Map();

    filteredPosts.forEach((post) => {
      const key = post.categoryName || '미분류';

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key).push(post);
    });

    if (groups.size === 0) {
      return [];
    }

    return [...groups.entries()].map(([name, groupPosts]) => {
      const cx = groupPosts.reduce((sum, post) => sum + post.x, 0) / groupPosts.length;
      const cy = groupPosts.reduce((sum, post) => sum + post.y, 0) / groupPosts.length;
      const maxDist = groupPosts.reduce((max, post) => Math.max(max, Math.hypot(post.x - cx, post.y - cy)), 0);

      return {
        color: getClusterColor(name, canvasTheme),
        cx,
        cy,
        name,
        radius: Math.max(72, maxDist + 48),
      };
    });
  }, [activeTab, canvasTheme, filteredPosts]);

  // 포커스된 간선 중 점수가 높고 서로 겹치지 않는 최대 4개에 공유 키워드 배지를 표시한다.
  const tooltipEdges = useMemo(() => {
    if (isPanning || draggingNodeId || focusedEdges.length === 0) {
      return [];
    }

    const candidates = focusedEdges
      .filter((edge) => edge.isExplicit || edge.sharedTags.length > 0)
      .map((edge) => {
        const from = postMap.get(edge.from);
        const to = postMap.get(edge.to);

        if (!from || !to) {
          return null;
        }

        return {
          edge,
          isDirectHover: edge.id === hoveredEdgeId,
          x: (from.x + to.x) / 2,
          y: (from.y + to.y) / 2,
        };
      })
      .filter(Boolean)
      .sort(
        (left, right) =>
          Number(right.isDirectHover) - Number(left.isDirectHover) || (right.edge.score ?? 0) - (left.edge.score ?? 0),
      );

    const placed = [];

    for (const candidate of candidates) {
      if (placed.length >= MAX_EDGE_TOOLTIPS) {
        break;
      }

      const tooClose = placed.some(
        (item) => Math.hypot(item.x - candidate.x, item.y - candidate.y) < MIN_TOOLTIP_DISTANCE,
      );

      if (!tooClose) {
        placed.push(candidate);
      }
    }

    return placed;
  }, [draggingNodeId, focusedEdges, hoveredEdgeId, isPanning, postMap]);

  const defaultLabelOpacity =
    posts.length > 12
      ? Math.min(0.76, Math.max(0, (zoom - 1) * 1.2))
      : Math.min(0.88, Math.max(0.62, 0.76 + (zoom - 1) * 0.4));

  const getSvgPoint = (event) => {
    if (!svgRef.current) {
      return null;
    }

    const ctm = svgRef.current.getScreenCTM();

    if (!ctm) {
      return null;
    }

    const point = svgRef.current.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(ctm.inverse());
  };

  const toGraphPoint = (svgPoint) => ({
    x: (svgPoint.x - pan.x) / zoom,
    y: (svgPoint.y - pan.y) / zoom,
  });

  const handleWheel = (event) => {
    event.preventDefault();
    onManualViewportChange?.();

    const point = getSvgPoint(event);

    if (!point) {
      return;
    }

    const nextZoom = clamp(zoom * Math.exp(-event.deltaY * 0.0015), 0.45, 2.5);

    if (nextZoom === zoom) {
      return;
    }

    const graphX = (point.x - pan.x) / zoom;
    const graphY = (point.y - pan.y) / zoom;

    setPan({
      x: point.x - graphX * nextZoom,
      y: point.y - graphY * nextZoom,
    });
    setZoom(nextZoom);
  };

  const handleCanvasPointerDown = (event) => {
    const point = getSvgPoint(event);

    if (!point) {
      return;
    }

    onManualViewportChange?.();
    const nodeElement = event.target.closest?.('[data-node-id]');
    const targetNodeId = nodeElement?.dataset.nodeId ?? null;

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);

    if (targetNodeId) {
      dragRef.current = {
        dragStarted: false,
        element: event.currentTarget,
        mode: 'node',
        moved: false,
        pointerId: event.pointerId,
        startX: point.x,
        startY: point.y,
        targetNodeId,
      };
      onHover(targetNodeId);
      return;
    }

    dragRef.current = {
      element: event.currentTarget,
      mode: 'pan',
      moved: false,
      pointerId: event.pointerId,
      startPanX: pan.x,
      startPanY: pan.y,
      startX: point.x,
      startY: point.y,
      targetNodeId: null,
    };
    setIsPanning(true);
    onInteractionChange?.(true);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;

    if (!drag) {
      return;
    }

    const rawPoint = getSvgPoint(event);

    if (!rawPoint) {
      return;
    }

    const movement = Math.hypot(rawPoint.x - drag.startX, rawPoint.y - drag.startY);

    if (drag.mode === 'node') {
      const graphPoint = toGraphPoint(rawPoint);

      if (!drag.dragStarted) {
        if (movement <= NODE_DRAG_THRESHOLD) {
          return;
        }

        drag.moved = true;
        drag.dragStarted = true;
        setDraggingNodeId(drag.targetNodeId);
        onInteractionChange?.(true);
        onNodeDragStart?.(drag.targetNodeId, graphPoint.x, graphPoint.y);
        return;
      }

      onNodeDragMove?.(drag.targetNodeId, graphPoint.x, graphPoint.y);
      return;
    }

    if (movement > 2) {
      drag.moved = true;
    }

    setPan({
      x: drag.startPanX + rawPoint.x - drag.startX,
      y: drag.startPanY + rawPoint.y - drag.startY,
    });
  };

  const finishDrag = () => {
    const drag = dragRef.current;

    if (!drag) {
      return;
    }

    drag.element?.releasePointerCapture?.(drag.pointerId);

    if (drag.mode === 'node') {
      if (drag.dragStarted) {
        onNodeDragEnd?.(drag.targetNodeId);
        setDraggingNodeId(null);
        onInteractionChange?.(false);
      } else if (!drag.moved) {
        onOpenPost(drag.targetNodeId);
      }
    } else {
      setIsPanning(false);
      onInteractionChange?.(false);
    }

    dragRef.current = null;
  };

  const svgCursor = isPanning || draggingNodeId ? 'grabbing' : 'grab';

  return (
    <svg
      ref={svgRef}
      className="h-full w-full overflow-visible"
      data-canvas-theme={canvasTheme}
      onPointerCancel={finishDrag}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onWheel={handleWheel}
      style={{ cursor: svgCursor, touchAction: 'none' }}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
    >
      <defs>
        {theme.useGlow ? (
          <filter id="star-glow" height="220%" width="220%" x="-60%" y="-60%">
            <feGaussianBlur result="blur" stdDeviation="2.8" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ) : null}
        {theme.showDotGrid ? (
          <pattern height="24" id="graph-light-dot-grid" patternUnits="userSpaceOnUse" width="24">
            <circle cx="12" cy="12" fill={theme.dotColor} r="1.15" />
          </pattern>
        ) : null}
      </defs>

      {theme.showDotGrid ? (
        <rect
          fill="url(#graph-light-dot-grid)"
          height={SVG_H + 640}
          pointerEvents="none"
          width={SVG_W + 1280}
          x={-640}
          y={-320}
        />
      ) : null}

      {theme.showStars ? (
        <g pointerEvents="none">
          {BACKGROUND_STARS.map((star, index) => (
            <circle
              key={index}
              cx={star.x}
              cy={star.y}
              fill={index % 3 === 0 ? '#FDE047' : '#FEF08A'}
              opacity={star.opacity}
              r={star.r}
            />
          ))}
        </g>
      ) : null}

      <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
        {categoryClusters.map((cluster) => (
          <g key={cluster.name} pointerEvents="none">
            <circle
              cx={cluster.cx}
              cy={cluster.cy}
              fill={cluster.color}
              fillOpacity={theme.clusterFillOpacity}
              r={cluster.radius}
              stroke={cluster.color}
              strokeDasharray="5 6"
              strokeOpacity={theme.clusterStrokeOpacity}
              strokeWidth={1.25}
            />
            <text
              fill={cluster.color}
              fontSize="12"
              fontWeight="700"
              letterSpacing="-0.02em"
              textAnchor="middle"
              x={cluster.cx}
              y={cluster.cy - cluster.radius - 10}
            >
              {cluster.name}
            </text>
          </g>
        ))}

        {renderedEdges.map((edge) => {
          const from = postMap.get(edge.from);
          const to = postMap.get(edge.to);

          if (!from || !to) {
            return null;
          }

          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const length = Math.sqrt(dx * dx + dy * dy);

          if (length < 1) {
            return null;
          }

          const ux = dx / length;
          const uy = dy / length;
          const fromRadius = graphNodeRadius(connectionCountById.get(from.id));
          const toRadius = graphNodeRadius(connectionCountById.get(to.id));
          const startGap = edge.isExplicit ? 7 : 3;
          const endGap = edge.isExplicit ? 11 : 4;
          const x1 = from.x + ux * (fromRadius + startGap);
          const y1 = from.y + uy * (fromRadius + startGap);
          const x2 = to.x - ux * (toRadius + endGap);
          const y2 = to.y - uy * (toRadius + endGap);
          const isLit = hoveredEdgeId === edge.id || focusedNodeIds.has(edge.from) || focusedNodeIds.has(edge.to);
          const hasFocus = focusedNodeIds.size > 0 || hoveredEdgeId != null;
          const edgeOpacity = hasFocus ? (isLit ? 0.94 : 0.08) : edgeBaseOpacity(edge, canvasTheme);
          const lineWidth = edgeWidth(edge);
          const dashArray = edge.isExplicit ? '4,4' : undefined;
          const lineEndX = edge.isExplicit ? x2 - ux * ARROW_LENGTH : x2;
          const lineEndY = edge.isExplicit ? y2 - uy * ARROW_LENGTH : y2;
          const arrowPoints = edge.isExplicit ? createArrowPoints(x2, y2, lineEndX, lineEndY, ux, uy) : null;
          const edgeColor = isLit ? theme.edgeLitColor : edge.isExplicit ? theme.edgeExplicitColor : theme.edgeColor;

          return (
            <g
              key={edge.id}
              data-graph-edge={edge.id}
              onMouseEnter={() => {
                if (!draggingNodeId && !isPanning) {
                  setHoveredEdgeId(edge.id);
                }
              }}
              onMouseLeave={() => setHoveredEdgeId((previous) => (previous === edge.id ? null : previous))}
              opacity={edgeOpacity}
              style={{ transition: 'opacity 0.18s' }}
            >
              <line
                stroke={edgeColor}
                strokeDasharray={dashArray}
                strokeLinecap="round"
                strokeWidth={isLit ? lineWidth + 0.9 : lineWidth}
                x1={x1}
                x2={lineEndX}
                y1={y1}
                y2={lineEndY}
              />
              {arrowPoints ? (
                <polygon
                  fill={edgeColor}
                  opacity="0.96"
                  points={arrowPoints}
                  stroke={isLight ? '#FFFFFF' : PRIMARY_SOFT}
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              ) : null}
            </g>
          );
        })}

        {filteredPosts.map((post) => {
          const degree = connectionCountById.get(post.id) ?? 0;
          const radius = graphNodeRadius(degree);
          const titleLines = splitNodeTitle(post.title);
          const isHovered = hoveredId === post.id;
          const isSelected = selectedId === post.id;
          const isDragged = draggingNodeId === post.id;
          const isFocused = isHovered || isSelected || isDragged;
          const isRelated = relatedNodeIds.has(post.id);
          const hasFocus = focusedNodeIds.size > 0;
          const isDimmed = hasFocus && !isFocused && !isRelated;
          const baseBrightness = isLight ? Math.min(1, 0.78 + degree * 0.06) : Math.min(1, 0.52 + degree * 0.14);
          const nodeOpacity = isDimmed
            ? isLight
              ? 0.22
              : 0.18
            : hasFocus && isRelated && !isFocused
              ? 0.92
              : isFocused
                ? 1
                : baseBrightness;
          const labelOpacity = isDimmed ? 0 : isFocused ? 1 : hasFocus && isRelated ? 0.9 : defaultLabelOpacity;
          const baseNodeColor =
            activeTab === 'category' ? getClusterColor(post.categoryName || '미분류', canvasTheme) : theme.nodeFill;
          const nodeFill = isFocused
            ? activeTab === 'category' && isLight
              ? baseNodeColor
              : theme.nodeFocusedFill
            : degree >= 4 && activeTab !== 'category'
              ? theme.nodeHubFill
              : baseNodeColor;
          const haloOpacity = isLight ? Math.min(0.26, 0.08 + degree * 0.04) : Math.min(0.32, 0.06 + degree * 0.055);
          const haloRadius = radius + Math.min(10, 3 + degree * 1.6);

          return (
            <g
              key={post.id}
              aria-label={`${post.title} 게시글 열기`}
              data-graph-node={post.id}
              data-graph-node-state={isFocused ? 'focused' : isRelated ? 'related' : isDimmed ? 'dimmed' : 'default'}
              data-node-id={post.id}
              onBlur={() => onHover(null)}
              onFocus={() => onHover(post.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpenPost(post.id);
                }
              }}
              onMouseEnter={() => {
                if (!draggingNodeId && !isPanning) {
                  onHover(post.id);
                }
              }}
              onMouseLeave={() => {
                if (!draggingNodeId) {
                  onHover(null);
                }
              }}
              role="button"
              style={{
                cursor: isDragged ? 'grabbing' : 'grab',
                opacity: nodeOpacity,
                transition: 'opacity 0.18s',
                touchAction: 'none',
              }}
              tabIndex={0}
            >
              {isFocused ? (
                <circle
                  cx={post.x}
                  cy={post.y}
                  fill={theme.focusedHaloFill}
                  opacity={isLight ? '0.26' : '0.34'}
                  r={radius + 11}
                />
              ) : (
                <circle
                  cx={post.x}
                  cy={post.y}
                  fill={activeTab === 'category' ? baseNodeColor : theme.haloFill}
                  opacity={haloOpacity}
                  r={haloRadius}
                />
              )}
              <circle
                cx={post.x}
                cy={post.y}
                fill={nodeFill}
                filter={theme.useGlow && (isFocused || degree >= 1) ? 'url(#star-glow)' : undefined}
                opacity={isFocused ? 1 : baseBrightness}
                r={radius}
                stroke={isFocused ? theme.nodeFocusedStroke : theme.nodeStroke}
                strokeDasharray={post.isPrivate ? '5,3' : undefined}
                strokeOpacity={isFocused ? 1 : isLight ? 0.95 : Math.min(0.92, 0.45 + degree * 0.14)}
                strokeWidth={isFocused ? 2.5 : post.isPrivate ? 2 : isLight ? 1.8 : 1.2}
              />
              {post.isPrivate ? <LockBadge x={post.x + radius * 0.52} y={post.y + radius * 0.52} /> : null}
              <text
                fill={isFocused ? theme.labelFocusedFill : theme.labelFill}
                fontFamily="var(--font-nanum-gothic-coding), system-ui, sans-serif"
                fontSize="12"
                fontWeight={isFocused ? '800' : '600'}
                opacity={labelOpacity}
                paintOrder="stroke"
                stroke={theme.labelStroke}
                strokeLinejoin="round"
                strokeWidth="4"
                textAnchor="middle"
                x={post.x}
                y={post.y + radius + 15}
              >
                {titleLines.map((line, index) => (
                  <tspan key={`${post.id}-${index}`} dy={index === 0 ? 0 : 16} x={post.x}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}

        {tooltipEdges.map(({ edge, x, y }) => (
          <EdgeKeywordTooltip key={`tooltip-${edge.id}`} canvasTheme={canvasTheme} edge={edge} x={x} y={y} />
        ))}
      </g>
    </svg>
  );
}

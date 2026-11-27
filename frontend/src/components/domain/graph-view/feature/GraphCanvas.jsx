'use client';

import { memo, useMemo, useRef, useState } from 'react';

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

const PAN_DRAG_THRESHOLD = 4;
const COMPASS_TICK_COUNT = 12;

/** 노드·간선 SVG와 캔버스 확대·이동, 고전 천체도 가이드 레이어를 렌더링한다. */
export const GraphCanvas = memo(function GraphCanvas({
  activeTab,
  canvasTheme = 'dark',
  edges,
  hoveredId,
  layoutMeta = null,
  onHover,
  onInteractionChange,
  onManualViewportChange,
  onOpenPost,
  pan,
  posts,
  selectedId,
  setPan,
  setZoom,
  svgRef,
  zoom,
}) {
  const dragRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);
  const theme = getGraphTheme(canvasTheme);
  const isLight = canvasTheme === 'light';

  const postMap = useMemo(() => new Map(posts.map((post) => [post.id, post])), [posts]);
  const renderedEdges = useMemo(
    () => edges.filter((edge) => postMap.has(edge.from) && postMap.has(edge.to)),
    [edges, postMap],
  );
  const connectionCountById = useMemo(() => {
    const counts = new Map(posts.map((post) => [post.id, 0]));

    renderedEdges.forEach((edge) => {
      counts.set(edge.from, (counts.get(edge.from) ?? 0) + 1);
      counts.set(edge.to, (counts.get(edge.to) ?? 0) + 1);
    });

    return counts;
  }, [posts, renderedEdges]);
  const focusedNodeIds = useMemo(() => {
    const ids = new Set([hoveredId, selectedId].filter((id) => id && postMap.has(id)));

    if (hoveredEdgeId) {
      const hoveredEdge = renderedEdges.find((edge) => edge.id === hoveredEdgeId);

      if (hoveredEdge) {
        ids.add(hoveredEdge.from);
        ids.add(hoveredEdge.to);
      }
    }

    return ids;
  }, [hoveredEdgeId, hoveredId, postMap, renderedEdges, selectedId]);
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

    posts.forEach((post) => {
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
        radius: Math.max(70, maxDist + 42),
      };
    });
  }, [activeTab, canvasTheme, posts]);

  const defaultLabelOpacity =
    posts.length > 12
      ? Math.min(0.76, Math.max(0, (zoom - 1) * 1.2))
      : Math.min(0.9, Math.max(0.64, 0.78 + (zoom - 1) * 0.4));

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

  const handleWheel = (event) => {
    event.preventDefault();
    onManualViewportChange?.();

    const point = getSvgPoint(event);

    if (!point) {
      return;
    }

    const nextZoom = clamp(zoom * Math.exp(-event.deltaY * 0.0015), 0.3, 2.5);

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

    dragRef.current = {
      element: event.currentTarget,
      moved: false,
      pointerId: event.pointerId,
      startPanX: pan.x,
      startPanY: pan.y,
      startX: point.x,
      startY: point.y,
      targetNodeId,
    };

    if (!targetNodeId) {
      setIsPanning(true);
      onInteractionChange?.(true);
    }
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

    if (!drag.moved) {
      if (movement <= PAN_DRAG_THRESHOLD) {
        return;
      }

      drag.moved = true;
      setIsPanning(true);
      onInteractionChange?.(true);
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

    if (drag.targetNodeId && !drag.moved) {
      onOpenPost(drag.targetNodeId);
    }

    if (isPanning || drag.moved || !drag.targetNodeId) {
      setIsPanning(false);
      onInteractionChange?.(false);
    }

    dragRef.current = null;
  };

  const svgCursor = isPanning ? 'grabbing' : 'grab';
  const opacityTransition = isPanning ? undefined : 'opacity 0.18s';

  return (
    <svg
      ref={svgRef}
      className="block h-full w-full"
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
            <feGaussianBlur result="blur" stdDeviation="2.6" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ) : null}
      </defs>

      <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
        {theme.showCelestialGuides && layoutMeta ? (
          <CelestialAtlasGuides activeTab={activeTab} layoutMeta={layoutMeta} theme={theme} />
        ) : null}

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
          const edgeOpacity = hasFocus ? (isLit ? 0.94 : 0.1) : edgeBaseOpacity(edge, canvasTheme);
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
                if (!isPanning) {
                  setHoveredEdgeId(edge.id);
                }
              }}
              onMouseLeave={() => setHoveredEdgeId((previous) => (previous === edge.id ? null : previous))}
              opacity={edgeOpacity}
              style={opacityTransition ? { transition: opacityTransition } : undefined}
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
                  stroke={isLight ? '#FCF9F2' : PRIMARY_SOFT}
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              ) : null}
            </g>
          );
        })}

        {posts.map((post) => {
          const degree = connectionCountById.get(post.id) ?? 0;
          const radius = graphNodeRadius(degree);
          const isHovered = hoveredId === post.id;
          const isSelected = selectedId === post.id;
          const isFocused = isHovered || isSelected;
          const isRelated = relatedNodeIds.has(post.id);
          const hasFocus = focusedNodeIds.size > 0;
          const isDimmed = hasFocus && !isFocused && !isRelated;
          const baseBrightness = isLight ? Math.min(1, 0.82 + degree * 0.05) : Math.min(1, 0.52 + degree * 0.14);
          const nodeOpacity = isDimmed
            ? isLight
              ? 0.24
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
          const haloOpacity = isLight ? Math.min(0.28, 0.09 + degree * 0.04) : Math.min(0.34, 0.08 + degree * 0.06);
          const haloRadius = radius + Math.min(11, 4 + degree * 1.6);
          const titleLines = labelOpacity > 0 ? splitNodeTitle(post.title) : null;

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
                if (!isPanning) {
                  onHover(post.id);
                }
              }}
              onMouseLeave={() => onHover(null)}
              role="button"
              style={{
                cursor: 'pointer',
                opacity: nodeOpacity,
                touchAction: 'none',
                ...(opacityTransition ? { transition: opacityTransition } : null),
              }}
              tabIndex={0}
            >
              {isFocused ? (
                <circle
                  cx={post.x}
                  cy={post.y}
                  fill={theme.focusedHaloFill}
                  opacity={isLight ? '0.24' : '0.34'}
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
                filter={theme.useGlow && isFocused ? 'url(#star-glow)' : undefined}
                opacity={isFocused ? 1 : baseBrightness}
                r={radius}
                stroke={isFocused ? theme.nodeFocusedStroke : theme.nodeStroke}
                strokeDasharray={post.isPrivate ? '5,3' : undefined}
                strokeOpacity={isFocused ? 1 : isLight ? 0.96 : Math.min(0.92, 0.45 + degree * 0.14)}
                strokeWidth={isFocused ? 2.4 : post.isPrivate ? 2 : isLight ? 1.8 : 1.2}
              />
              {post.isPrivate ? <LockBadge x={post.x + radius * 0.52} y={post.y + radius * 0.52} /> : null}
              {titleLines ? (
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
              ) : null}
            </g>
          );
        })}
      </g>
    </svg>
  );
});

/** 라이트 모드 '고전 천체도·아틀라스 성도' 컨셉의 천구 동심 궤도선과 방위 눈금 레이어다. */
function CelestialAtlasGuides({ activeTab, layoutMeta, theme }) {
  const { centerX, centerY, coreRadius, outerRingRadii = [] } = layoutMeta;
  const maxRing = outerRingRadii.length > 0 ? Math.max(...outerRingRadii) : Math.max(coreRadius, 150);
  const compassRadius = maxRing + 34;
  const axisExtent = compassRadius + 28;
  const ticks = Array.from({ length: COMPASS_TICK_COUNT }, (_, index) => {
    const angle = (Math.PI * 2 * index) / COMPASS_TICK_COUNT - Math.PI / 2;
    const isCardinal = index % 3 === 0;
    const innerR = compassRadius - (isCardinal ? 9 : 5);
    const outerR = compassRadius + (isCardinal ? 4 : 2);

    return {
      isCardinal,
      x1: centerX + Math.cos(angle) * innerR,
      x2: centerX + Math.cos(angle) * outerR,
      y1: centerY + Math.sin(angle) * innerR,
      y2: centerY + Math.sin(angle) * outerR,
    };
  });

  return (
    <g data-celestial-guides="true" pointerEvents="none">
      {/* 천구 자오선·적도 십자 보조선 */}
      <line
        stroke={theme.celestialAxisColor}
        strokeDasharray="3 6"
        strokeOpacity="0.22"
        strokeWidth="1"
        x1={centerX - axisExtent}
        x2={centerX + axisExtent}
        y1={centerY}
        y2={centerY}
      />
      <line
        stroke={theme.celestialAxisColor}
        strokeDasharray="3 6"
        strokeOpacity="0.22"
        strokeWidth="1"
        x1={centerX}
        x2={centerX}
        y1={centerY - axisExtent}
        y2={centerY + axisExtent}
      />

      {/* 연결된 노드들이 모이는 중앙 천구 코어 원 */}
      {activeTab !== 'category' && coreRadius > 0 ? (
        <circle
          cx={centerX}
          cy={centerY}
          fill={theme.celestialCoreFill}
          fillOpacity="0.26"
          r={coreRadius}
          stroke={theme.celestialRingColor}
          strokeDasharray="6 5"
          strokeOpacity="0.34"
          strokeWidth="1.15"
        />
      ) : null}

      {/* 고립된 노드들이 둘러싸는 외곽 천구 궤도선 */}
      {activeTab !== 'category'
        ? outerRingRadii.map((radius, index) => (
            <circle
              key={`orbit-${radius}-${index}`}
              cx={centerX}
              cy={centerY}
              fill="none"
              r={radius}
              stroke={theme.celestialRingColor}
              strokeOpacity="0.24"
              strokeWidth="1"
            />
          ))
        : null}

      {/* 외곽 천구 테두리 및 12방위 성도 눈금 */}
      <circle
        cx={centerX}
        cy={centerY}
        fill="none"
        r={compassRadius}
        stroke={theme.celestialRingColor}
        strokeOpacity="0.3"
        strokeWidth="1"
      />
      <circle
        cx={centerX}
        cy={centerY}
        fill="none"
        r={compassRadius + 6}
        stroke={theme.celestialRingColor}
        strokeDasharray="2 5"
        strokeOpacity="0.2"
        strokeWidth="0.85"
      />
      {ticks.map((tick, index) => (
        <line
          key={`tick-${index}`}
          stroke={theme.celestialRingColor}
          strokeOpacity={tick.isCardinal ? '0.52' : '0.32'}
          strokeWidth={tick.isCardinal ? '1.4' : '1'}
          x1={tick.x1}
          x2={tick.x2}
          y1={tick.y1}
          y2={tick.y2}
        />
      ))}
    </g>
  );
}

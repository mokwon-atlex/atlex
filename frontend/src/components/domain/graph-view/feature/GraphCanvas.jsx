'use client';

import { useMemo, useRef, useState } from 'react';

import {
  ARROW_LENGTH,
  PRIMARY,
  PRIMARY_SOFT,
  SVG_H,
  SVG_W,
  clamp,
  createArrowPoints,
  edgeWidth,
  graphNodeRadius,
  splitNodeTitle,
} from '@/lib/graph-view/graph-view-utils';
import { LockBadge } from '@/components/domain/graph-view/ui/GraphViewIcons';

/** 노드·간선 SVG와 확대, 이동, 선택 상호작용을 렌더링한다. */
export function GraphCanvas({
  activeTab,
  currentUserId,
  edges,
  hoveredId,
  minSharedTags,
  onHover,
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
  const focusedNodeIds = useMemo(() => new Set([hoveredId, selectedId].filter(Boolean)), [hoveredId, selectedId]);
  const focusedEdges = useMemo(
    () => renderedEdges.filter((edge) => focusedNodeIds.has(edge.from) || focusedNodeIds.has(edge.to)),
    [focusedNodeIds, renderedEdges],
  );
  const relatedNodeIds = useMemo(() => {
    const relatedIds = new Set(focusedNodeIds);

    focusedEdges.forEach((edge) => {
      relatedIds.add(edge.from);
      relatedIds.add(edge.to);
    });

    return relatedIds;
  }, [focusedEdges, focusedNodeIds]);
  const defaultLabelOpacity =
    filteredPosts.length > 12
      ? Math.min(0.72, Math.max(0, (zoom - 1) * 1.2))
      : Math.min(0.82, Math.max(0.56, 0.72 + (zoom - 1) * 0.4));

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

    const nodeElement = event.target.closest?.('[data-node-id]');
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
      targetNodeId: nodeElement?.dataset.nodeId ?? null,
    };
    setIsPanning(true);
    if (nodeElement?.dataset.nodeId) {
      onHover(nodeElement.dataset.nodeId);
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

    if (drag.targetNodeId && !drag.moved) {
      onOpenPost(drag.targetNodeId);
    }

    dragRef.current = null;
    setIsPanning(false);
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="h-full w-full"
      onPointerCancel={finishDrag}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onWheel={handleWheel}
      style={{ cursor: isPanning ? 'grabbing' : 'grab', touchAction: 'none' }}
    >
      <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
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
          const isLit =
            hoveredId === edge.from || hoveredId === edge.to || selectedId === edge.from || selectedId === edge.to;
          const hasFocus = focusedNodeIds.size > 0;
          const edgeOpacity = hasFocus ? (isLit ? 0.96 : 0.08) : edge.isExplicit ? 0.78 : 0.36;
          const lineWidth = edgeWidth(edge);
          const dashArray = edge.isExplicit ? '4,4' : undefined;
          const lineEndX = edge.isExplicit ? x2 - ux * ARROW_LENGTH : x2;
          const lineEndY = edge.isExplicit ? y2 - uy * ARROW_LENGTH : y2;
          const arrowPoints = edge.isExplicit ? createArrowPoints(x2, y2, lineEndX, lineEndY, ux, uy) : null;
          const edgeColor = isLit || edge.isExplicit ? PRIMARY : '#9BDCEB';

          return (
            <g data-graph-edge={edge.id} key={edge.id} opacity={edgeOpacity} style={{ transition: 'opacity 0.18s' }}>
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
                  stroke={PRIMARY_SOFT}
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              ) : null}
            </g>
          );
        })}

        {filteredPosts.map((post) => {
          const radius = graphNodeRadius(connectionCountById.get(post.id));
          const titleLines = splitNodeTitle(post.title);
          const isHovered = hoveredId === post.id;
          const isSelected = selectedId === post.id;
          const isFocused = isHovered || isSelected;
          const isRelated = relatedNodeIds.has(post.id);
          const hasFocus = focusedNodeIds.size > 0;
          const isDimmed = hasFocus && !isFocused && !isRelated;
          const nodeOpacity = isDimmed ? 0.18 : hasFocus && isRelated && !isFocused ? 0.88 : 1;
          const labelOpacity = isDimmed ? 0 : isFocused ? 1 : hasFocus && isRelated ? 0.88 : defaultLabelOpacity;

          return (
            <g
              aria-label={`${post.title} 게시글 열기`}
              key={post.id}
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
              onMouseEnter={() => onHover(post.id)}
              onMouseLeave={() => onHover(null)}
              role="button"
              style={{
                cursor: 'pointer',
                opacity: nodeOpacity,
                transition: 'opacity 0.18s',
                touchAction: 'none',
              }}
              tabIndex={0}
            >
              {isFocused ? <circle cx={post.x} cy={post.y} fill={PRIMARY} opacity="0.2" r={radius + 9} /> : null}
              <circle
                cx={post.x}
                cy={post.y}
                fill={isFocused ? '#218BAA' : PRIMARY}
                opacity={isFocused ? 1 : 0.9}
                r={radius}
                stroke={isFocused ? '#14748D' : '#3AA7C6'}
                strokeDasharray={post.isPrivate ? '5,3' : undefined}
                strokeWidth={isFocused ? 2.5 : post.isPrivate ? 2 : 1.5}
              />
              {post.isPrivate ? <LockBadge x={post.x + radius * 0.52} y={post.y + radius * 0.52} /> : null}
              <text
                fill={isFocused ? '#176E87' : '#3B879D'}
                fontFamily="var(--font-nanum-gothic-coding), system-ui, sans-serif"
                fontSize="12"
                fontWeight={isFocused ? '800' : '700'}
                opacity={labelOpacity}
                paintOrder="stroke"
                stroke="rgba(248,248,245,0.96)"
                strokeLinejoin="round"
                strokeWidth="4"
                textAnchor="middle"
                x={post.x}
                y={post.y + radius + 14}
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
      </g>
    </svg>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";

import {
  ARROW_LENGTH,
  CANVAS_BG,
  SVG_H,
  SVG_W,
  createArrowPoints,
  edgeColor,
  edgeWidth,
  nodeColor,
} from "@/components/domain/graph-view/lib/graph-view-utils";
import { EdgeKeywordTooltip } from "@/components/domain/graph-view/ui/EdgeKeywordTooltip";
import {
  LockBadge,
  NodeDocIcon,
} from "@/components/domain/graph-view/ui/GraphViewIcons";

export function GraphCanvas({
  activeTab,
  edges,
  hoveredId,
  minSharedTags,
  onHover,
  onSelect,
  pan,
  posts,
  selectedId,
  setPan,
  showExplicitEdges,
  showTagEdges,
  svgRef,
  zoom,
}) {
  const dragRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);
  const postMap = useMemo(
    () => new Map(posts.map((post) => [post.id, post])),
    [posts]
  );
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
    [edges, minSharedTags, showExplicitEdges, showTagEdges]
  );
  const filteredPosts =
    activeTab === "내 포스트"
      ? posts.filter((post) => post.author.id === "park")
      : posts;
  const filteredPostIds = new Set(filteredPosts.map((post) => post.id));

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

  const handleCanvasPointerDown = (event) => {
    const point = getSvgPoint(event);

    if (!point) {
      return;
    }

    const nodeElement = event.target.closest?.("[data-node-id]");
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
      onSelect(selectedId === drag.targetNodeId ? null : drag.targetNodeId);
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
      style={{ cursor: isPanning ? "grabbing" : "grab", touchAction: "none" }}
    >
      <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
        {visibleEdges.map((edge) => {
          const from = postMap.get(edge.from);
          const to = postMap.get(edge.to);

          if (!from || !to || !filteredPostIds.has(from.id) || !filteredPostIds.has(to.id)) {
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
          const startGap = edge.isExplicit ? 12 : 10;
          const endGap = edge.isExplicit ? 18 : 14;
          const x1 = from.x + ux * (from.radius + startGap);
          const y1 = from.y + uy * (from.radius + startGap);
          const x2 = to.x - ux * (to.radius + endGap);
          const y2 = to.y - uy * (to.radius + endGap);
          const color = edgeColor(edge);
          const isLit =
            hoveredEdgeId === edge.id ||
            hoveredId === edge.from ||
            hoveredId === edge.to ||
            selectedId === edge.from ||
            selectedId === edge.to;
          const isDimmed = hoveredId || selectedId || hoveredEdgeId;
          const edgeOpacity = isDimmed ? (isLit ? 0.96 : 0.16) : 0.86;
          const lineWidth = edgeWidth(edge);
          const dashArray = edge.isExplicit ? "7,6" : undefined;
          const lineEndX = edge.isExplicit ? x2 - ux * ARROW_LENGTH : x2;
          const lineEndY = edge.isExplicit ? y2 - uy * ARROW_LENGTH : y2;
          const arrowPoints = edge.isExplicit
            ? createArrowPoints(x2, y2, lineEndX, lineEndY, ux, uy)
            : null;
          const tooltipX = x1 + (lineEndX - x1) * 0.56 - uy * 20;
          const tooltipY = y1 + (lineEndY - y1) * 0.56 + ux * 20;
          const isEdgeHovered = hoveredEdgeId === edge.id;

          return (
            <g
              key={edge.id}
              onMouseEnter={() => setHoveredEdgeId(edge.id)}
              onMouseLeave={() => setHoveredEdgeId(null)}
              opacity={edgeOpacity}
              style={{ transition: "opacity 0.18s" }}
            >
              <line
                stroke="transparent"
                strokeLinecap="round"
                strokeWidth={Math.max(lineWidth + 14, 18)}
                x1={x1}
                x2={x2}
                y1={y1}
                y2={y2}
              />
              <line
                stroke={CANVAS_BG}
                strokeDasharray={dashArray}
                strokeLinecap="butt"
                strokeWidth={lineWidth + (isEdgeHovered ? 4.2 : 2.2)}
                opacity="0.92"
                x1={x1}
                x2={lineEndX}
                y1={y1}
                y2={lineEndY}
              />
              <line
                stroke={color}
                strokeDasharray={dashArray}
                strokeLinecap="butt"
                strokeWidth={lineWidth + (isEdgeHovered ? 1.2 : 0)}
                x1={x1}
                x2={lineEndX}
                y1={y1}
                y2={lineEndY}
              />
              {arrowPoints ? (
                <polygon
                  fill={color}
                  opacity="0.96"
                  points={arrowPoints}
                  stroke={CANVAS_BG}
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              ) : null}
              {isEdgeHovered ? (
                <EdgeKeywordTooltip edge={edge} x={tooltipX} y={tooltipY} />
              ) : null}
            </g>
          );
        })}

        {filteredPosts.map((post) => {
          const color = nodeColor(post);
          const isHovered = hoveredId === post.id;
          const isSelected = selectedId === post.id;
          const isDimmed = (hoveredId || selectedId) && !isHovered && !isSelected;

          return (
            <g
              key={post.id}
              data-node-id={post.id}
              onMouseEnter={() => onHover(post.id)}
              onMouseLeave={() => onHover(null)}
              style={{
                cursor: "pointer",
                opacity: isDimmed ? 0.38 : 1,
                transition: "opacity 0.18s",
                touchAction: "none",
              }}
            >
              {isHovered || isSelected ? (
                <circle
                  cx={post.x}
                  cy={post.y}
                  fill={color}
                  opacity="0.14"
                  r={post.radius + 14}
                />
              ) : null}
              <circle
                cx={post.x}
                cy={post.y + 3}
                fill="rgba(15,23,42,0.12)"
                r={post.radius * 0.88}
              />
              <circle
                cx={post.x}
                cy={post.y}
                fill="#FFFFFF"
                r={post.radius}
                stroke={color}
                strokeDasharray={post.isPrivate ? "5,3" : undefined}
                strokeWidth={isHovered || isSelected ? 4.5 : post.isPrivate ? 3.5 : 3.25}
              />
              <NodeDocIcon color={color} cx={post.x} cy={post.y} r={post.radius} />
              {post.isPrivate ? (
                <LockBadge x={post.x + post.radius * 0.52} y={post.y + post.radius * 0.52} />
              ) : null}
              <text
                fill={isHovered || isSelected ? "#111827" : "#242832"}
                fontFamily="var(--font-nanum-gothic-coding), system-ui, sans-serif"
                fontSize="14"
                fontWeight={isHovered || isSelected ? "800" : "700"}
                paintOrder="stroke"
                stroke="rgba(248,248,245,0.96)"
                strokeLinejoin="round"
                strokeWidth="4"
                textAnchor="middle"
                x={post.x}
                y={post.y + post.radius + 18}
              >
                {post.title.length > 12 ? `${post.title.slice(0, 12)}...` : post.title}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export const SVG_W = 840;
export const SVG_H = 640;
export const ARROW_LENGTH = 20;
export const ARROW_HEIGHT = 16;
export const PRIMARY = "#66C0DC";
export const PRIMARY_SOFT = "#E8F7FB";
export const CANVAS_BG = "#F8F8F5";

const TAG_META = {
  철학: { color: "#6252D9", bg: "#ECE9FF", text: "#4C36B8" },
  디자인: { color: "#159D91", bg: "#DCF8F4", text: "#0D766E" },
  개발: { color: "#E25555", bg: "#FDE2E2", text: "#B91C1C" },
  AI: { color: "#2F7ED8", bg: "#E0EEFF", text: "#1D4ED8" },
  UX: { color: "#7B5CE1", bg: "#EEE8FF", text: "#5B35C8" },
  일상: { color: "#9AA3AF", bg: "#F3F4F6", text: "#374151" },
};

const NODE_COLOR_BY_TAG = {
  철학: "#5547D5",
  UX: "#5547D5",
  디자인: "#108477",
  AI: "#2B7EDB",
  개발: "#346DC8",
  일상: "#9AA3AF",
};

export function createPosts(data, authors) {
  const authorMap = new Map(authors.map((author) => [author.id, author]));

  return data.nodes.map((node) => {
    const author = authorMap.get(node.authorId) ?? authors[0];

    return {
      id: node.id,
      title: node.label,
      author,
      tags: node.tags,
      excerpt: node.excerpt,
      views: node.views,
      likes: node.likes,
      isPrivate: Boolean(node.private),
      x: (node.x / 100) * SVG_W,
      y: (node.y / 100) * SVG_H,
      radius: Math.max(node.size / 2.05, 27),
    };
  });
}

export function createEdges(data) {
  const nodeMap = new Map(data.nodes.map((node) => [node.id, node]));

  return data.edges.map((edge, index) => ({
    id: `${edge.from}-${edge.to}-${index}`,
    from: edge.from,
    to: edge.to,
    strength: edge.dashed
      ? 0
      : Math.max(1, Math.min(3, Math.round(edge.width / 2))),
    sharedTags: getSharedTags(edge, nodeMap),
    primaryTag: inferEdgeTag(edge, nodeMap),
    isExplicit: Boolean(edge.dashed),
  }));
}

export function nodeColor(post) {
  if (post.isPrivate) {
    return "#9B9BA8";
  }

  return NODE_COLOR_BY_TAG[post.tags[0]] ?? PRIMARY;
}

export function edgeColor(edge) {
  if (edge.isExplicit || !edge.primaryTag) {
    return "#AEB5BF";
  }

  return tagMeta(edge.primaryTag).color;
}

export function edgeWidth(edge) {
  if (edge.isExplicit) {
    return 2.25;
  }

  return [0, 2.75, 4.25, 5.5][edge.strength] ?? 2.75;
}

export function createArrowPoints(tipX, tipY, baseX, baseY, ux, uy) {
  const normalX = -uy;
  const normalY = ux;
  const halfHeight = ARROW_HEIGHT / 2;

  return [
    `${tipX},${tipY}`,
    `${baseX + normalX * halfHeight},${baseY + normalY * halfHeight}`,
    `${baseX - normalX * halfHeight},${baseY - normalY * halfHeight}`,
  ].join(" ");
}

export function tagMeta(tag) {
  return TAG_META[tag] ?? { color: PRIMARY, bg: PRIMARY_SOFT, text: "#14748D" };
}

export function toggleSetValue(previous, value) {
  const next = new Set(previous);

  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }

  return next;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function inferEdgeTag(edge, nodeMap) {
  if (edge.dashed) {
    return null;
  }

  const from = nodeMap.get(edge.from);
  const sharedTag = getSharedTags(edge, nodeMap)[0];

  return sharedTag ?? from?.tags[0] ?? null;
}

function getSharedTags(edge, nodeMap) {
  const from = nodeMap.get(edge.from);
  const to = nodeMap.get(edge.to);

  if (!from || !to) {
    return [];
  }

  return from.tags.filter((tag) => to.tags.includes(tag));
}

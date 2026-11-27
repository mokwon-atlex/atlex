import { SVG_H, SVG_W, clamp, graphNodeRadius } from '@/lib/graph-view/graph-view-utils';

const AVATAR_COLORS = ['#6252D9', '#159D91', '#2F7ED8', '#E25555', '#7B5CE1', '#D97706'];
const GOLDEN_ANGLE = 2.399963229728653;

/**
 * @typedef {object} GraphNodeResponse
 * @property {number} id 게시글 ID
 * @property {string} title 게시글 제목
 * @property {number} authorId 작성자 DB ID
 * @property {string} authorUserId 작성자 아이디
 * @property {string} authorName 작성자 표시 이름
 * @property {number | null} categoryId 카테고리 ID
 * @property {string | null} categoryName 카테고리 이름
 * @property {boolean} isPublic 공개 여부
 * @property {string[]} tags 게시글 태그 목록
 */

/**
 * @typedef {object} GraphEdgeResponse
 * @property {number} sourcePostId 출발 게시글 ID
 * @property {number} targetPostId 도착 게시글 ID
 * @property {number} score 관계 유사도 점수
 * @property {string[]} sharedKeywords 공통 키워드 목록
 */

/**
 * 그래프 API 응답을 그래프 화면에서 사용하는 노드, 간선, 초기 고정 좌표 데이터로 변환한다.
 *
 * @param {{ nodes?: GraphNodeResponse[], edges?: GraphEdgeResponse[] } | undefined} graph API 응답
 * @param {{ groupByCategory?: boolean }} [options] 배치 옵션
 * @returns {{ authors: object[], edges: object[], layoutMeta: object, posts: object[], tagCounts: [string, number][] }} 화면 데이터
 */
export function toGraphViewData(graph, { groupByCategory = false } = {}) {
  const nodes = Array.isArray(graph?.nodes) ? [...graph.nodes].sort(compareNodes) : [];
  const edges = Array.isArray(graph?.edges) ? graph.edges : [];
  const authorsById = new Map();
  const tagCounts = new Map();

  const postDrafts = nodes.map((node) => {
    const author = getOrCreateAuthor(node, authorsById);
    const tags = normalizeTags(node.tags);

    author.count += 1;
    tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1));

    return {
      id: String(node.id),
      title: node.title?.trim() || '제목 없는 게시글',
      author,
      categoryName: node.categoryName ?? null,
      tags,
      isPrivate: node.isPublic === false,
    };
  });

  const postIds = new Set(postDrafts.map((post) => post.id));
  const mappedEdges = edges.flatMap((edge, index) => {
    const from = String(edge.sourcePostId);
    const to = String(edge.targetPostId);

    if (!postIds.has(from) || !postIds.has(to) || from === to) {
      return [];
    }

    const sharedTags = normalizeTags(edge.sharedKeywords);

    return [
      {
        id: `${from}-${to}-${index}`,
        from,
        to,
        strength: Math.min(3, Math.max(1, sharedTags.length)),
        sharedTags,
        primaryTag: sharedTags[0] ?? null,
        score: Number(edge.score) || 0,
        isExplicit: false,
      },
    ];
  });

  const { layoutMeta, positions } = computeGraphLayout(postDrafts, mappedEdges, { groupByCategory });
  const posts = postDrafts.map((post, index) => ({
    ...post,
    radius: 24,
    x: positions[index].x,
    y: positions[index].y,
  }));

  return {
    authors: [...authorsById.values()].sort((left, right) => left.name.localeCompare(right.name, 'ko')),
    edges: mappedEdges,
    layoutMeta,
    posts,
    tagCounts: [...tagCounts.entries()].sort(
      (left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'ko'),
    ),
  };
}

/**
 * 표시 중인 간선 기준으로 '가운데 연결 코어 + 바깥 고립 노드 링' 고정 좌표를 결정론적으로 계산한다.
 * `groupByCategory`가 켜지면 카테고리별 원형 클러스터를 만들고, 각 클러스터 내부에서도 동일한 규칙을 적용한다.
 *
 * @param {object[]} posts 배치할 게시글 목록
 * @param {object[]} edges 현재 표시되는 간선 목록
 * @param {{ groupByCategory?: boolean }} [options] 배치 옵션
 * @returns {{ positions: Array<{ x: number, y: number }>, layoutMeta: { centerX: number, centerY: number, coreRadius: number, outerRingRadii: number[] } }}
 */
export function computeGraphLayout(posts, edges, { groupByCategory = false } = {}) {
  const centerX = SVG_W / 2;
  const centerY = SVG_H / 2;

  if (posts.length === 0) {
    return {
      layoutMeta: { centerX, centerY, coreRadius: 0, outerRingRadii: [] },
      positions: [],
    };
  }

  if (posts.length === 1) {
    return {
      layoutMeta: { centerX, centerY, coreRadius: 72, outerRingRadii: [] },
      positions: [{ x: Math.round(centerX), y: Math.round(centerY) }],
    };
  }

  if (groupByCategory) {
    const categoryGroups = new Map();

    posts.forEach((post, index) => {
      const key = post.categoryName || '미분류';

      if (!categoryGroups.has(key)) {
        categoryGroups.set(key, []);
      }

      categoryGroups.get(key).push({ index, post });
    });

    if (categoryGroups.size > 1) {
      return computeCategoryClusterLayout(posts, edges, categoryGroups, centerX, centerY);
    }
  }

  const localLayout = computeCoreAndOuterRingLayout(posts, edges, { compact: false });

  return {
    layoutMeta: {
      centerX,
      centerY,
      coreRadius: localLayout.coreRadius,
      outerRingRadii: localLayout.outerRingRadii,
    },
    positions: localLayout.positions.map((pos) => ({
      x: Math.round(centerX + pos.x),
      y: Math.round(centerY + pos.y),
    })),
  };
}

/** 카테고리별 원형 클러스터를 만들고, 각 클러스터 안에서 연결 노드(중심)·고립 노드(외곽)를 배치한다. */
function computeCategoryClusterLayout(posts, edges, categoryGroups, centerX, centerY) {
  const sortedCategories = [...categoryGroups.keys()].sort((left, right) => left.localeCompare(right, 'ko'));
  const clusterLayouts = sortedCategories.map((categoryName) => {
    const entries = categoryGroups.get(categoryName);
    const localPosts = entries.map((entry) => entry.post);
    const localIds = new Set(localPosts.map((post) => post.id));
    const localEdges = edges.filter((edge) => localIds.has(edge.from) && localIds.has(edge.to));
    const localResult = computeCoreAndOuterRingLayout(localPosts, localEdges, { compact: true });
    const clusterRadius = Math.max(66, localResult.boundingRadius + 30);

    return {
      categoryName,
      clusterRadius,
      entries,
      positions: localResult.positions,
    };
  });

  const maxClusterRadius = Math.max(...clusterLayouts.map((cluster) => cluster.clusterRadius));
  const count = clusterLayouts.length;
  const minCenterSpacing = maxClusterRadius * 2 + 64;
  const ringRadius =
    count === 2
      ? Math.max(160, minCenterSpacing / 2)
      : Math.max(175, minCenterSpacing / (2 * Math.sin(Math.PI / count)));
  const positions = Array.from({ length: posts.length }, () => ({ x: Math.round(centerX), y: Math.round(centerY) }));

  clusterLayouts.forEach((cluster, clusterIndex) => {
    const angle = (Math.PI * 2 * clusterIndex) / count - Math.PI / 2;
    const anchorX = centerX + Math.cos(angle) * ringRadius;
    const anchorY = centerY + Math.sin(angle) * ringRadius;

    cluster.entries.forEach((entry, localIndex) => {
      positions[entry.index] = {
        x: Math.round(anchorX + cluster.positions[localIndex].x),
        y: Math.round(anchorY + cluster.positions[localIndex].y),
      };
    });
  });

  return {
    layoutMeta: {
      centerX,
      centerY,
      coreRadius: Math.round(ringRadius),
      outerRingRadii: [Math.round(ringRadius + maxClusterRadius)],
    },
    positions,
  };
}

/**
 * 원점(0, 0)을 중심으로 연결된 노드들을 가운데 코어에 배치하고,
 * 고립된 노드들을 코어 바깥의 동심 링으로 둘러싸는 좌표를 계산한다.
 */
function computeCoreAndOuterRingLayout(posts, edges, { compact = false } = {}) {
  const indexById = new Map(posts.map((post, index) => [post.id, index]));
  const degrees = Array.from({ length: posts.length }, () => 0);
  const linkedPairs = new Set();
  const links = [];

  edges.forEach((edge) => {
    const sourceIndex = indexById.get(edge.from);
    const targetIndex = indexById.get(edge.to);

    if (sourceIndex == null || targetIndex == null || sourceIndex === targetIndex) {
      return;
    }

    const pairKey = [sourceIndex, targetIndex].sort((left, right) => left - right).join(':');

    if (linkedPairs.has(pairKey)) {
      return;
    }

    linkedPairs.add(pairKey);
    degrees[sourceIndex] += 1;
    degrees[targetIndex] += 1;

    const score = Number(edge.score);
    const normalizedScore = Number.isFinite(score) && score > 0 ? clamp(score, 0.1, 1) : 0.35;

    links.push({ score: normalizedScore, sourceIndex, targetIndex });
  });

  const connectedIndices = [];
  const isolatedIndices = [];

  posts.forEach((_, index) => {
    if (degrees[index] > 0) {
      connectedIndices.push(index);
    } else {
      isolatedIndices.push(index);
    }
  });

  const positions = Array.from({ length: posts.length }, () => ({ x: 0, y: 0 }));
  const nodeGap = compact ? 36 : 52;
  const minArcSpacing = compact ? 68 : 92;
  const ringStep = compact ? 66 : 84;
  let coreRadius = 0;
  let maxExtent = 0;

  // 1. 연결된 노드들은 연결 수가 많은 허브가 중심에 오도록 정적 force-directed로 수렴시킨다.
  if (connectedIndices.length === 1) {
    const onlyIndex = connectedIndices[0];

    positions[onlyIndex] = { x: 0, y: 0 };
    coreRadius = compact ? 42 : 68;
    maxExtent = graphNodeRadius(degrees[onlyIndex]);
  } else if (connectedIndices.length > 1) {
    const sortedConnected = [...connectedIndices].sort((left, right) => degrees[right] - degrees[left] || left - right);
    const localIndexByGlobal = new Map(sortedConnected.map((globalIndex, localIndex) => [globalIndex, localIndex]));
    const coreNodes = sortedConnected.map((globalIndex, localIndex) => {
      const angle = localIndex * GOLDEN_ANGLE;
      const radius = localIndex === 0 ? 0 : (compact ? 24 : 34) * Math.sqrt(localIndex);

      return {
        degree: degrees[globalIndex],
        globalIndex,
        radius: graphNodeRadius(degrees[globalIndex]),
        vx: 0,
        vy: 0,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    });
    const coreLinks = links
      .map((link) => ({
        score: link.score,
        source: localIndexByGlobal.get(link.sourceIndex),
        target: localIndexByGlobal.get(link.targetIndex),
      }))
      .filter((link) => link.source != null && link.target != null);

    convergeConnectedCore(coreNodes, coreLinks, { compact, nodeGap });

    // 수렴된 연결 코어의 무게 중심을 원점(0, 0)으로 정렬한다.
    const meanX = coreNodes.reduce((sum, node) => sum + node.x, 0) / coreNodes.length;
    const meanY = coreNodes.reduce((sum, node) => sum + node.y, 0) / coreNodes.length;

    coreNodes.forEach((node) => {
      const centeredX = node.x - meanX;
      const centeredY = node.y - meanY;

      positions[node.globalIndex] = { x: centeredX, y: centeredY };
      maxExtent = Math.max(maxExtent, Math.hypot(centeredX, centeredY) + node.radius);
    });

    coreRadius = Math.max(compact ? 52 : 80, Math.round(maxExtent + (compact ? 22 : 30)));
  }

  // 2. 고립된 노드들은 연결 코어 바깥을 동심 원형 링으로 둘러싸도록 배치한다.
  const outerRingRadii = [];

  if (isolatedIndices.length > 0) {
    const rawIsolatedRadius = (isolatedIndices.length * minArcSpacing) / (Math.PI * 2);
    const allIsolatedRadius = clamp(rawIsolatedRadius, compact ? 56 : 112, compact ? 120 : 210);
    const connectedOuterRadius = Math.max(coreRadius + (compact ? 48 : 74), compact ? 88 : 178);
    const fallbackIsolatedRadius = isolatedIndices.length === 1 ? 0 : allIsolatedRadius;
    let currentRadius = connectedIndices.length > 0 ? connectedOuterRadius : fallbackIsolatedRadius;
    let cursor = 0;
    let ringIndex = 0;

    while (cursor < isolatedIndices.length) {
      const remaining = isolatedIndices.length - cursor;
      const ringCapacity = Math.max(6, Math.floor((2 * Math.PI * currentRadius) / minArcSpacing));
      const capacity = currentRadius <= 0 ? 1 : ringCapacity;
      const countInRing = Math.min(remaining, capacity);
      const angleOffset = -Math.PI / 2 + (ringIndex * Math.PI) / Math.max(countInRing, 1);

      if (currentRadius > 0) {
        outerRingRadii.push(Math.round(currentRadius));
      }

      for (let slot = 0; slot < countInRing; slot += 1) {
        const globalIndex = isolatedIndices[cursor + slot];
        const angle = angleOffset + (slot / countInRing) * Math.PI * 2;
        const x = Math.cos(angle) * currentRadius;
        const y = Math.sin(angle) * currentRadius;

        positions[globalIndex] = { x, y };
        maxExtent = Math.max(maxExtent, Math.hypot(x, y) + graphNodeRadius(0));
      }

      cursor += countInRing;
      ringIndex += 1;
      currentRadius = currentRadius <= 0 ? ringStep : currentRadius + ringStep;
    }
  }

  return {
    boundingRadius: Math.round(maxExtent),
    coreRadius,
    outerRingRadii,
    positions,
  };
}

/** 연결된 노드 그룹에 반발력·간선 인력·허브 중심력을 적용해 겹침 없이 수렴시킨다. */
function convergeConnectedCore(nodes, links, { compact, nodeGap }) {
  const count = nodes.length;
  const steps = count > 40 ? 70 : 120;
  const linkDistance = compact
    ? Math.max(76, Math.min(115, 130 - Math.sqrt(count) * 8))
    : Math.max(108, Math.min(168, 195 - Math.sqrt(count) * 10));
  const repulsionStrength = (compact ? 11000 : 19000) / Math.sqrt(count);
  const cutoffDistSq = 360 * 360;

  for (let step = 0; step < steps; step += 1) {
    const forceX = Array.from({ length: count }, () => 0);
    const forceY = Array.from({ length: count }, () => 0);

    for (let i = 0; i < count; i += 1) {
      const source = nodes[i];

      for (let j = i + 1; j < count; j += 1) {
        const target = nodes[j];
        let dx = source.x - target.x;
        let dy = source.y - target.y;
        let distSq = dx * dx + dy * dy;

        if (distSq > cutoffDistSq) {
          continue;
        }

        if (distSq < 1) {
          const angle = (i + 1) * (j + 1);

          dx = Math.cos(angle);
          dy = Math.sin(angle);
          distSq = 1;
        }

        const dist = Math.sqrt(distSq);
        const unitX = dx / dist;
        const unitY = dy / dist;
        const repulsion = repulsionStrength / distSq;
        const minDist = source.radius + target.radius + nodeGap;
        const overlap = Math.max(0, minDist - dist);
        const collisionForce = (overlap / minDist) * 7.5;
        const total = repulsion + collisionForce;

        forceX[i] += unitX * total;
        forceY[i] += unitY * total;
        forceX[j] -= unitX * total;
        forceY[j] -= unitY * total;
      }
    }

    links.forEach(({ score, source: i, target: j }) => {
      const source = nodes[i];
      const target = nodes[j];
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.max(Math.hypot(dx, dy), 1);
      const targetDist = linkDistance * (1.12 - score * 0.24);
      const strength = (0.048 + score * 0.025) / Math.max(1, Math.sqrt(source.degree * target.degree));
      const attraction = (dist - targetDist) * strength;
      const unitX = dx / dist;
      const unitY = dy / dist;

      forceX[i] += unitX * attraction;
      forceY[i] += unitY * attraction;
      forceX[j] -= unitX * attraction;
      forceY[j] -= unitY * attraction;
    });

    nodes.forEach((node, index) => {
      // 연결 수가 많은 허브일수록 코어 중앙에 자연스럽게 자리 잡도록 중심 인력을 부여한다.
      const centerGravity = 0.012 + Math.min(node.degree, 6) * 0.003;

      forceX[index] -= node.x * centerGravity;
      forceY[index] -= node.y * centerGravity;
      node.vx = clamp((node.vx + forceX[index]) * 0.76, -14, 14);
      node.vy = clamp((node.vy + forceY[index]) * 0.76, -14, 14);
      node.x += node.vx;
      node.y += node.vy;
    });

    resolveCoreCollisions(nodes, nodeGap);
  }
}

/** 코어 내부의 겹친 노드 쌍을 최소 간격 이상으로 밀어낸다. */
function resolveCoreCollisions(nodes, gap) {
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const source = nodes[i];
      const target = nodes[j];
      const minDist = source.radius + target.radius + gap;
      let dx = source.x - target.x;
      let dy = source.y - target.y;

      if (Math.abs(dx) >= minDist || Math.abs(dy) >= minDist) {
        continue;
      }

      let dist = Math.hypot(dx, dy);

      if (dist >= minDist) {
        continue;
      }

      if (dist < 1) {
        const angle = (i + 1) * (j + 1);

        dx = Math.cos(angle);
        dy = Math.sin(angle);
        dist = 1;
      }

      const shift = (minDist - dist) / 2;
      const unitX = dx / dist;
      const unitY = dy / dist;

      source.x += unitX * shift;
      source.y += unitY * shift;
      target.x -= unitX * shift;
      target.y -= unitY * shift;
    }
  }
}

/** 카테고리별 클러스터 중심 좌표를 계산한다. */
export function createCategoryAnchors(posts) {
  const categories = [...new Set(posts.map((post) => post.categoryName || '미분류'))].sort((a, b) =>
    a.localeCompare(b, 'ko'),
  );
  const anchors = new Map();

  if (categories.length <= 1) {
    categories.forEach((category) => {
      anchors.set(category, { x: SVG_W / 2, y: SVG_H / 2 });
    });
    return anchors;
  }

  const rx = SVG_W * 0.3;
  const ry = SVG_H * 0.27;

  categories.forEach((category, index) => {
    const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2;

    anchors.set(category, {
      x: SVG_W / 2 + Math.cos(angle) * rx,
      y: SVG_H / 2 + Math.sin(angle) * ry,
    });
  });

  return anchors;
}

/** 노드 ID를 자연수 순서로 정렬해 좌표 배치 결과를 안정화한다. */
function compareNodes(left, right) {
  return String(left.id).localeCompare(String(right.id), 'en', { numeric: true });
}

/** 같은 작성자는 하나의 메타 정보를 공유하도록 작성자 객체를 재사용한다. */
function getOrCreateAuthor(node, authorsById) {
  const id = String(node.authorUserId ?? node.authorId ?? 'unknown');
  const existing = authorsById.get(id);

  if (existing) {
    return existing;
  }

  const name = node.authorName?.trim() || node.authorUserId?.trim() || '알 수 없는 작성자';
  const author = {
    id,
    name,
    initial: name.slice(0, 1).toUpperCase(),
    avatarColor: AVATAR_COLORS[hashString(id) % AVATAR_COLORS.length],
    count: 0,
  };

  authorsById.set(id, author);
  return author;
}

/** API의 비어 있거나 잘못된 키워드 값을 안전한 문자열 배열로 정리한다. */
function normalizeTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags.filter((tag) => typeof tag === 'string' && tag.trim()).map((tag) => tag.trim());
}

/** 작성자마다 변하지 않는 아바타 색상 인덱스를 계산한다. */
function hashString(value) {
  return [...value].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 0);
}

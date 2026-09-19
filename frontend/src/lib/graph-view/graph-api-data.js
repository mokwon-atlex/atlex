import { SVG_H, SVG_W, graphNodeRadius } from '@/lib/graph-view/graph-view-utils';

const AVATAR_COLORS = ['#6252D9', '#159D91', '#2F7ED8', '#E25555', '#7B5CE1', '#D97706'];

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
 * 그래프 API 응답을 그래프 화면에서 사용하는 노드, 간선, 필터 데이터로 변환한다.
 * API에 좌표가 없으므로 같은 응답은 항상 같은 위치를 사용하도록 노드 순서에서 좌표를 계산한다.
 *
 * @param {{ nodes?: GraphNodeResponse[], edges?: GraphEdgeResponse[] } | undefined} graph API 응답
 * @returns {{ authors: object[], edges: object[], posts: object[], tagCounts: [string, number][] }} 화면 데이터
 */
export function toGraphViewData(graph) {
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
  const positions = createForceDirectedPositions(postDrafts, mappedEdges);
  const posts = postDrafts.map((post, index) => ({
    ...post,
    radius: 24,
    x: positions[index].x,
    y: positions[index].y,
  }));

  return {
    authors: [...authorsById.values()].sort((left, right) => left.name.localeCompare(right.name, 'ko')),
    edges: mappedEdges,
    posts,
    tagCounts: [...tagCounts.entries()].sort(
      (left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'ko'),
    ),
  };
}

/** 노드 ID를 자연수 순서로 정렬해 좌표 배치 결과를 안정화한다. */
function compareNodes(left, right) {
  return String(left.id).localeCompare(String(right.id), 'en', { numeric: true });
}

/** 관계 간선의 인력과 노드 간 반발력을 계산해 고정된 그래프 배치를 만든다. */
function createForceDirectedPositions(posts, edges) {
  const seedPositions = createNodePositions(posts.length);

  if (posts.length <= 1) {
    return seedPositions;
  }

  const indexById = new Map(posts.map((post, index) => [post.id, index]));
  const layoutNodes = posts.map((post, index) => ({
    id: post.id,
    velocityX: 0,
    velocityY: 0,
    x: seedPositions[index].x,
    y: seedPositions[index].y,
  }));
  const degrees = Array.from({ length: posts.length }, () => 0);
  const linkedPairs = new Set();
  const links = edges.flatMap((edge) => {
    const sourceIndex = indexById.get(edge.from);
    const targetIndex = indexById.get(edge.to);

    if (sourceIndex == null || targetIndex == null || sourceIndex === targetIndex) {
      return [];
    }

    const pairKey = [sourceIndex, targetIndex].sort((left, right) => left - right).join(':');

    if (linkedPairs.has(pairKey)) {
      return [];
    }

    linkedPairs.add(pairKey);
    degrees[sourceIndex] += 1;
    degrees[targetIndex] += 1;
    return [{ sourceIndex, targetIndex }];
  });
  const minX = 54;
  const maxX = SVG_W - minX;
  const minY = 54;
  const maxY = SVG_H - minY;
  const nodeRadii = degrees.map((degree) => graphNodeRadius(degree));
  const nodeGap = Math.max(32, 64 - Math.sqrt(posts.length) * 2);
  const linkDistance = Math.max(130, Math.min(210, 270 - Math.sqrt(posts.length) * 17));
  const simulationSteps = Math.max(90, Math.min(220, 250 - posts.length));
  const repulsionStrength = 25000 / Math.sqrt(posts.length);

  for (let step = 0; step < simulationSteps; step += 1) {
    const forceX = Array.from({ length: posts.length }, () => 0);
    const forceY = Array.from({ length: posts.length }, () => 0);

    for (let sourceIndex = 0; sourceIndex < layoutNodes.length; sourceIndex += 1) {
      for (let targetIndex = sourceIndex + 1; targetIndex < layoutNodes.length; targetIndex += 1) {
        const source = layoutNodes[sourceIndex];
        const target = layoutNodes[targetIndex];
        let dx = source.x - target.x;
        let dy = source.y - target.y;
        let distanceSquared = dx * dx + dy * dy;

        if (distanceSquared < 1) {
          const angle = (sourceIndex + 1) * (targetIndex + 1);

          dx = Math.cos(angle);
          dy = Math.sin(angle);
          distanceSquared = 1;
        }

        const distance = Math.sqrt(distanceSquared);
        const repulsion = repulsionStrength / distanceSquared;
        const unitX = dx / distance;
        const unitY = dy / distance;
        const minimumDistance = nodeRadii[sourceIndex] + nodeRadii[targetIndex] + nodeGap;
        const collision = Math.max(0, minimumDistance - distance);
        const collisionForce = (collision / minimumDistance) * 7;

        forceX[sourceIndex] += unitX * (repulsion + collisionForce);
        forceY[sourceIndex] += unitY * (repulsion + collisionForce);
        forceX[targetIndex] -= unitX * (repulsion + collisionForce);
        forceY[targetIndex] -= unitY * (repulsion + collisionForce);
      }
    }

    links.forEach(({ sourceIndex, targetIndex }) => {
      const source = layoutNodes[sourceIndex];
      const target = layoutNodes[targetIndex];
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.max(Math.hypot(dx, dy), 1);
      const linkStrength = 0.04 / Math.max(1, Math.sqrt(degrees[sourceIndex] * degrees[targetIndex]));
      const attraction = (distance - linkDistance) * linkStrength;
      const unitX = dx / distance;
      const unitY = dy / distance;

      forceX[sourceIndex] += unitX * attraction;
      forceY[sourceIndex] += unitY * attraction;
      forceX[targetIndex] -= unitX * attraction;
      forceY[targetIndex] -= unitY * attraction;
    });

    layoutNodes.forEach((node, index) => {
      forceX[index] += (SVG_W / 2 - node.x) * 0.002;
      forceY[index] += (SVG_H / 2 - node.y) * 0.002;
      node.velocityX = Math.max(-14, Math.min(14, (node.velocityX + forceX[index]) * 0.78));
      node.velocityY = Math.max(-14, Math.min(14, (node.velocityY + forceY[index]) * 0.78));
      node.x = Math.max(minX, Math.min(maxX, node.x + node.velocityX));
      node.y = Math.max(minY, Math.min(maxY, node.y + node.velocityY));
    });
    resolveNodeCollisions(layoutNodes, nodeRadii, nodeGap, minX, maxX, minY, maxY);
  }

  return layoutNodes.map((node) => ({ x: Math.round(node.x), y: Math.round(node.y) }));
}

/** 노드 크기와 여백을 기준으로 겹친 노드를 다시 밀어내 제목과 클릭 영역의 간섭을 줄인다. */
function resolveNodeCollisions(nodes, radii, gap, minX, maxX, minY, maxY) {
  for (let sourceIndex = 0; sourceIndex < nodes.length; sourceIndex += 1) {
    for (let targetIndex = sourceIndex + 1; targetIndex < nodes.length; targetIndex += 1) {
      const source = nodes[sourceIndex];
      const target = nodes[targetIndex];
      let dx = source.x - target.x;
      let dy = source.y - target.y;
      let distance = Math.hypot(dx, dy);
      const minimumDistance = radii[sourceIndex] + radii[targetIndex] + gap;

      if (distance >= minimumDistance) {
        continue;
      }

      if (distance < 1) {
        const angle = (sourceIndex + 1) * (targetIndex + 1);

        dx = Math.cos(angle);
        dy = Math.sin(angle);
        distance = 1;
      }

      const shift = (minimumDistance - distance) / 2;
      const unitX = dx / distance;
      const unitY = dy / distance;

      source.x = Math.max(minX, Math.min(maxX, source.x + unitX * shift));
      source.y = Math.max(minY, Math.min(maxY, source.y + unitY * shift));
      target.x = Math.max(minX, Math.min(maxX, target.x - unitX * shift));
      target.y = Math.max(minY, Math.min(maxY, target.y - unitY * shift));
    }
  }
}

/** 제목 영역까지 고려해 노드 간 간격을 확보하는 동심원 좌표를 만든다. */
function createNodePositions(count) {
  if (count === 0) {
    return [];
  }

  if (count === 1) {
    return [{ x: SVG_W / 2, y: SVG_H / 2 }];
  }

  const ringCounts = createRingCounts(count);
  const radii = createRingRadii(ringCounts.length);

  return ringCounts.flatMap((nodesInRing, ringIndex) => {
    const angleOffset = -Math.PI / 2 + (ringIndex * Math.PI) / nodesInRing;

    return Array.from({ length: nodesInRing }, (_, positionInRing) => {
      const angle = angleOffset + (positionInRing / nodesInRing) * Math.PI * 2;
      const radius = radii[ringIndex];

      return {
        x: SVG_W / 2 + Math.cos(angle) * radius,
        y: SVG_H / 2 + Math.sin(angle) * radius,
      };
    });
  });
}

/** 전체 노드 수에 맞춰 원별 노드 수를 균형 있게 나눈다. */
function createRingCounts(count) {
  if (count <= 9) {
    return [count];
  }

  if (count <= 18) {
    const innerCount = Math.round(count * 0.4);

    return [innerCount, count - innerCount];
  }

  const innerCount = 5;
  const middleCount = Math.round((count - innerCount) * 0.4);

  return [innerCount, middleCount, count - innerCount - middleCount];
}

/** 제목이 화면 밖으로 나가지 않는 범위에서 원마다 충분한 반지름을 배정한다. */
function createRingRadii(ringCount) {
  if (ringCount === 1) {
    return [210];
  }

  if (ringCount === 2) {
    return [115, 225];
  }

  return [95, 160, 225];
}

/** 같은 작성자는 하나의 필터 항목을 공유하도록 작성자 정보를 재사용한다. */
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

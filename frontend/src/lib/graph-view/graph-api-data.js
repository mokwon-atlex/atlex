import { SVG_H, SVG_W } from '@/lib/graph-view/graph-view-utils';

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
  const positions = createNodePositions(nodes.length);

  const posts = nodes.map((node, index) => {
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
      color: createNodeColor(index),
      x: positions[index].x,
      y: positions[index].y,
      radius: 24,
    };
  });

  const postIds = new Set(posts.map((post) => post.id));
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

/** 인접한 노드도 구분되는 색을 갖도록 황금각 기반의 색상을 만든다. */
function createNodeColor(index) {
  const hue = (210 + index * 137.508) % 360;

  return `hsl(${hue.toFixed(3)} 62% 46%)`;
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

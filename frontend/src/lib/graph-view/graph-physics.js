import { createCategoryAnchors } from '@/lib/graph-view/graph-api-data';
import { SVG_H, SVG_W, clamp, graphNodeRadius } from '@/lib/graph-view/graph-view-utils';

const BOUNDS_MARGIN_X = SVG_W * 0.45;
const BOUNDS_MARGIN_Y = SVG_H * 0.45;
const MIN_X = -BOUNDS_MARGIN_X;
const MAX_X = SVG_W + BOUNDS_MARGIN_X;
const MIN_Y = -BOUNDS_MARGIN_Y;
const MAX_Y = SVG_H + BOUNDS_MARGIN_Y;
const MAX_SPEED = 18;
const DAMPING = 0.78;
const ALPHA_DECAY = 0.93;
const SLEEP_ALPHA = 0.015;
const SLEEP_MOVEMENT = 0.12;

/**
 * 실시간 드래그·전개 애니메이션을 위한 경량 force-directed 물리 시뮬레이션 상태를 생성한다.
 *
 * @param {object[]} posts 그래프 게시글 노드 목록
 * @param {object[]} edges 그래프 간선 목록
 * @param {{ animateEntry?: boolean, groupByCategory?: boolean }} [options] 시뮬레이션 옵션
 */
export function createPhysicsSimulation(posts, edges, { animateEntry = false, groupByCategory = false } = {}) {
  const categoryAnchors = groupByCategory ? createCategoryAnchors(posts) : new Map();
  const useCategoryClustering = groupByCategory && categoryAnchors.size > 1;
  const indexById = new Map(posts.map((post, index) => [post.id, index]));
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

    const score = Number(edge.score);
    const normalizedScore = Number.isFinite(score) && score > 0 ? clamp(score, 0.1, 1) : 0.35;

    return [{ score: normalizedScore, sourceIndex, targetIndex }];
  });

  const nodes = posts.map((post, index) => {
    const categoryKey = post.categoryName || '미분류';
    const anchor = categoryAnchors.get(categoryKey) ?? { x: SVG_W / 2, y: SVG_H / 2 };
    const shouldBloom = animateEntry && posts.length > 1;
    // 초기 진입·탭 전환 시 중심/클러스터 앵커 쪽에서 부드럽게 펼쳐지도록 시작 좌표를 살짝 당긴다.
    const startX = shouldBloom ? post.x * 0.8 + anchor.x * 0.2 : post.x;
    const startY = shouldBloom ? post.y * 0.8 + anchor.y * 0.2 : post.y;

    return {
      anchor,
      degree: degrees[index],
      homeX: post.x,
      homeY: post.y,
      id: post.id,
      radius: graphNodeRadius(degrees[index]),
      vx: 0,
      vy: 0,
      x: startX,
      y: startY,
    };
  });

  const nodeCount = Math.max(posts.length, 1);

  return {
    alpha: animateEntry && posts.length > 1 ? 0.55 : 0,
    indexById,
    isResetting: false,
    linkDistance: Math.max(130, Math.min(210, 270 - Math.sqrt(nodeCount) * 17)),
    links,
    nodeGap: Math.max(32, 64 - Math.sqrt(nodeCount) * 2),
    nodes,
    pinnedIndex: null,
    repulsionStrength: 24000 / Math.sqrt(nodeCount),
    useCategoryClustering,
  };
}

/**
 * 시뮬레이션이 현재 추가 프레임 연산이 필요한 상태인지 반환한다.
 *
 * @param {ReturnType<typeof createPhysicsSimulation>} simulation 시뮬레이션 상태
 */
export function isSimulationActive(simulation) {
  return simulation.pinnedIndex != null || simulation.alpha >= SLEEP_ALPHA;
}

/**
 * 드래그 중인 노드를 포인터 좌표에 임시 고정하고 주변 물리 연산을 깨운다.
 *
 * @param {ReturnType<typeof createPhysicsSimulation>} simulation 시뮬레이션 상태
 * @param {string} nodeId 드래그 대상 노드 ID
 * @param {number} x 그래프 SVG X 좌표
 * @param {number} y 그래프 SVG Y 좌표
 */
export function pinSimulationNode(simulation, nodeId, x, y) {
  const index = simulation.indexById.get(nodeId);

  if (index == null) {
    return;
  }

  const node = simulation.nodes[index];

  simulation.isResetting = false;
  simulation.pinnedIndex = index;
  node.x = clamp(x, MIN_X, MAX_X);
  node.y = clamp(y, MIN_Y, MAX_Y);
  node.vx = 0;
  node.vy = 0;
  simulation.alpha = Math.max(simulation.alpha, 0.55);
}

/**
 * 드래그 종료 시 노드 고정을 해제해 물리 균형에 따라 부드럽게 안착시킨다.
 *
 * @param {ReturnType<typeof createPhysicsSimulation>} simulation 시뮬레이션 상태
 */
export function releaseSimulationNode(simulation) {
  if (simulation.pinnedIndex == null) {
    return;
  }

  simulation.pinnedIndex = null;
  simulation.alpha = Math.max(simulation.alpha, 0.34);
}

/**
 * 모든 노드를 초기 자동 배치 좌표로 되돌린다.
 *
 * @param {ReturnType<typeof createPhysicsSimulation>} simulation 시뮬레이션 상태
 * @param {{ animate?: boolean }} [options] 애니메이션 여부
 */
export function resetSimulationLayout(simulation, { animate = true } = {}) {
  simulation.pinnedIndex = null;

  if (!animate) {
    simulation.isResetting = false;
    simulation.alpha = 0;
    simulation.nodes.forEach((node) => {
      node.x = node.homeX;
      node.y = node.homeY;
      node.vx = 0;
      node.vy = 0;
    });
    return;
  }

  simulation.isResetting = true;
  simulation.alpha = 0.85;
}

/**
 * 물리 시뮬레이션을 1프레임 진행하고, 좌표가 변했으면 true를 반환한다.
 *
 * @param {ReturnType<typeof createPhysicsSimulation>} simulation 시뮬레이션 상태
 * @returns {boolean} 좌표 갱신 여부
 */
export function stepSimulation(simulation) {
  const { links, nodeGap, nodes, pinnedIndex, repulsionStrength, useCategoryClustering } = simulation;

  if (nodes.length <= 1 || !isSimulationActive(simulation)) {
    return false;
  }

  if (simulation.isResetting) {
    return stepResetLayout(simulation);
  }

  const forceX = Array.from({ length: nodes.length }, () => 0);
  const forceY = Array.from({ length: nodes.length }, () => 0);

  // 1. 모든 노드 쌍 사이의 반발력과 겹침 방지 충돌력을 계산한다.
  for (let sourceIndex = 0; sourceIndex < nodes.length; sourceIndex += 1) {
    for (let targetIndex = sourceIndex + 1; targetIndex < nodes.length; targetIndex += 1) {
      const source = nodes[sourceIndex];
      const target = nodes[targetIndex];
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
      const minimumDistance = source.radius + target.radius + nodeGap;
      const collision = Math.max(0, minimumDistance - distance);
      const collisionForce = (collision / minimumDistance) * 6.5;
      const total = repulsion + collisionForce;

      forceX[sourceIndex] += unitX * total;
      forceY[sourceIndex] += unitY * total;
      forceX[targetIndex] -= unitX * total;
      forceY[targetIndex] -= unitY * total;
    }
  }

  // 2. 연결 간선의 유사도 점수를 반영한 탄성 인력을 계산한다.
  links.forEach(({ score, sourceIndex, targetIndex }) => {
    const source = nodes[sourceIndex];
    const target = nodes[targetIndex];
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.max(Math.hypot(dx, dy), 1);
    const targetDistance = simulation.linkDistance * (1.12 - score * 0.24);
    const baseStrength = (0.045 + score * 0.03) / Math.max(1, Math.sqrt(source.degree * target.degree));
    // 드래그 중인 노드와 직접 연결된 이웃은 반응성을 높여 탄성감 있게 따라오게 한다.
    const dragBoost = sourceIndex === pinnedIndex || targetIndex === pinnedIndex ? 1.85 : 1;
    const attraction = (distance - targetDistance) * baseStrength * dragBoost;
    const unitX = dx / distance;
    const unitY = dy / distance;

    forceX[sourceIndex] += unitX * attraction;
    forceY[sourceIndex] += unitY * attraction;
    forceX[targetIndex] -= unitX * attraction;
    forceY[targetIndex] -= unitY * attraction;
  });

  // 3. 카테고리 클러스터 앵커 또는 중앙 중력을 적용해 그래프가 화면 밖으로 흩어지지 않게 유지한다.
  const anchorStrength = useCategoryClustering ? 0.016 : 0.0032;
  const effectiveAlpha = pinnedIndex != null ? Math.max(simulation.alpha, 0.48) : simulation.alpha;
  let maxMovement = 0;

  nodes.forEach((node, index) => {
    if (index === pinnedIndex) {
      node.vx = 0;
      node.vy = 0;
      return;
    }

    forceX[index] += (node.anchor.x - node.x) * anchorStrength;
    forceY[index] += (node.anchor.y - node.y) * anchorStrength;

    node.vx = clamp((node.vx + forceX[index] * effectiveAlpha) * DAMPING, -MAX_SPEED, MAX_SPEED);
    node.vy = clamp((node.vy + forceY[index] * effectiveAlpha) * DAMPING, -MAX_SPEED, MAX_SPEED);

    const nextX = clamp(node.x + node.vx, MIN_X, MAX_X);
    const nextY = clamp(node.y + node.vy, MIN_Y, MAX_Y);
    const movement = Math.hypot(nextX - node.x, nextY - node.y);

    if (movement > maxMovement) {
      maxMovement = movement;
    }

    node.x = nextX;
    node.y = nextY;
  });

  resolveActiveCollisions(nodes, nodeGap, pinnedIndex);

  if (pinnedIndex == null) {
    simulation.alpha *= ALPHA_DECAY;

    if (simulation.alpha < SLEEP_ALPHA && maxMovement < SLEEP_MOVEMENT) {
      simulation.alpha = 0;
      nodes.forEach((node) => {
        node.vx = 0;
        node.vy = 0;
      });
    }
  }

  return true;
}

/** 배치 재정렬 시 초기 균형 좌표로 부드럽게 수렴시킨다. */
function stepResetLayout(simulation) {
  let maxDistance = 0;

  simulation.nodes.forEach((node) => {
    const dx = node.homeX - node.x;
    const dy = node.homeY - node.y;
    const distance = Math.hypot(dx, dy);

    if (distance > maxDistance) {
      maxDistance = distance;
    }

    node.x += dx * 0.24;
    node.y += dy * 0.24;
    node.vx = 0;
    node.vy = 0;
  });

  if (maxDistance < 0.6) {
    simulation.nodes.forEach((node) => {
      node.x = node.homeX;
      node.y = node.homeY;
    });
    simulation.isResetting = false;
    simulation.alpha = 0;
  }

  return true;
}

/** 드래그 중 고정된 노드를 유지하면서 겹친 노드를 부드럽게 밀어낸다. */
function resolveActiveCollisions(nodes, gap, pinnedIndex) {
  for (let sourceIndex = 0; sourceIndex < nodes.length; sourceIndex += 1) {
    for (let targetIndex = sourceIndex + 1; targetIndex < nodes.length; targetIndex += 1) {
      const source = nodes[sourceIndex];
      const target = nodes[targetIndex];
      let dx = source.x - target.x;
      let dy = source.y - target.y;
      let distance = Math.hypot(dx, dy);
      const minimumDistance = source.radius + target.radius + gap;

      if (distance >= minimumDistance) {
        continue;
      }

      if (distance < 1) {
        const angle = (sourceIndex + 1) * (targetIndex + 1);

        dx = Math.cos(angle);
        dy = Math.sin(angle);
        distance = 1;
      }

      const overlap = (minimumDistance - distance) * 0.35;
      const unitX = dx / distance;
      const unitY = dy / distance;

      if (sourceIndex === pinnedIndex) {
        target.x = clamp(target.x - unitX * overlap, MIN_X, MAX_X);
        target.y = clamp(target.y - unitY * overlap, MIN_Y, MAX_Y);
      } else if (targetIndex === pinnedIndex) {
        source.x = clamp(source.x + unitX * overlap, MIN_X, MAX_X);
        source.y = clamp(source.y + unitY * overlap, MIN_Y, MAX_Y);
      } else {
        const half = overlap / 2;

        source.x = clamp(source.x + unitX * half, MIN_X, MAX_X);
        source.y = clamp(source.y + unitY * half, MIN_Y, MAX_Y);
        target.x = clamp(target.x - unitX * half, MIN_X, MAX_X);
        target.y = clamp(target.y - unitY * half, MIN_Y, MAX_Y);
      }
    }
  }
}

/** 현재 시뮬레이션 노드 좌표를 ID 기준 맵 객체로 추출한다. */
export function snapshotSimulationPositions(simulation) {
  const positions = {};

  simulation.nodes.forEach((node) => {
    positions[node.id] = { x: node.x, y: node.y };
  });

  return positions;
}

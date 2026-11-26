export const SVG_W = 840;
export const SVG_H = 640;
export const ARROW_LENGTH = 20;
export const ARROW_HEIGHT = 16;
export const PRIMARY = '#FACC15';
export const PRIMARY_SOFT = '#1E1B12';
export const GRAPH_THEME_STORAGE_KEY = 'atlex-graph-canvas-theme';
export const CANVAS_BG = 'radial-gradient(circle at 50% 45%, #0E172A 0%, #070B16 55%, #03050A 100%)';

/** 그래프 캔버스 전용 라이트·다크 테마 색상과 배경 규칙이다. */
export const GRAPH_THEMES = {
  dark: {
    canvasBackground: CANVAS_BG,
    clusterFillOpacity: 0.055,
    clusterPalette: ['#E0F2FE', '#93C5FD', '#A7F3D0', '#FDE68A', '#BAE6FD'],
    clusterStrokeOpacity: 0.3,
    dotColor: null,
    edgeColor: '#FBBF24',
    edgeExplicitColor: '#FDE047',
    edgeLitColor: '#FEF08A',
    focusedHaloFill: '#FACC15',
    haloFill: '#F59E0B',
    labelFill: '#CBD5E1',
    labelFocusedFill: '#F8FAFC',
    labelStroke: 'rgba(6, 9, 19, 0.92)',
    legendLineColor: '#FBBF24',
    nodeFill: '#FDE047',
    nodeFocusedFill: '#FEF08A',
    nodeFocusedStroke: '#FACC15',
    nodeHubFill: '#FEF08A',
    nodeStroke: '#FEF08A',
    showDotGrid: false,
    showStars: true,
    useGlow: true,
  },
  light: {
    canvasBackground: 'radial-gradient(circle at 50% 45%, #FFFFFF 0%, #F8FAFC 58%, #EEF2F7 100%)',
    clusterFillOpacity: 0.075,
    clusterPalette: ['#0284C7', '#0D9488', '#4F46E5', '#D97706', '#E11D48'],
    clusterStrokeOpacity: 0.34,
    dotColor: 'rgba(100, 116, 139, 0.24)',
    edgeColor: '#64748B',
    edgeExplicitColor: '#0284C7',
    edgeLitColor: '#0284C7',
    focusedHaloFill: '#38BDF8',
    haloFill: '#7DD3FC',
    labelFill: '#334155',
    labelFocusedFill: '#0F172A',
    labelStroke: 'rgba(248, 250, 252, 0.94)',
    legendLineColor: '#0284C7',
    nodeFill: '#0284C7',
    nodeFocusedFill: '#0EA5E9',
    nodeFocusedStroke: '#0369A1',
    nodeHubFill: '#0369A1',
    nodeStroke: '#FFFFFF',
    showDotGrid: true,
    showStars: false,
    useGlow: false,
  },
};

const TAG_META = {
  철학: { color: '#6252D9', bg: '#ECE9FF', text: '#4C36B8' },
  디자인: { color: '#159D91', bg: '#DCF8F4', text: '#0D766E' },
  개발: { color: '#E25555', bg: '#FDE2E2', text: '#B91C1C' },
  AI: { color: '#2F7ED8', bg: '#E0EEFF', text: '#1D4ED8' },
  UX: { color: '#7B5CE1', bg: '#EEE8FF', text: '#5B35C8' },
  일상: { color: '#9AA3AF', bg: '#F3F4F6', text: '#374151' },
};

/** 캔버스 테마 이름에 해당하는 토큰 객체를 반환한다. */
export function getGraphTheme(canvasTheme) {
  return canvasTheme === 'light' ? GRAPH_THEMES.light : GRAPH_THEMES.dark;
}

/** 카테고리 이름과 캔버스 테마에 맞는 결정론적 클러스터 색상을 반환한다. */
export function getClusterColor(key, canvasTheme = 'dark') {
  const palette = getGraphTheme(canvasTheme).clusterPalette;
  const text = String(key ?? '');
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return palette[hash % palette.length];
}

/** API 응답에서 계산한 노드 고유 색상을 반환한다. */
export function nodeColor(post, canvasTheme = 'dark') {
  return post?.color ?? getGraphTheme(canvasTheme).nodeFill;
}

/** 노드 제목을 두 줄 안에서 읽기 좋게 나누고, 넘치는 글자는 말줄임표로 표시한다. */
export function splitNodeTitle(title, maxLineLength = 7) {
  const normalizedTitle = String(title ?? '').trim();
  const maxVisibleLength = maxLineLength * 2;

  if (normalizedTitle.length <= maxLineLength) {
    return [normalizedTitle];
  }

  const firstLine = normalizedTitle.slice(0, maxLineLength);
  const remainingTitle = normalizedTitle.slice(maxLineLength, maxVisibleLength);
  const secondLine =
    normalizedTitle.length > maxVisibleLength
      ? `${remainingTitle.slice(0, Math.max(maxLineLength - 1, 1))}…`
      : remainingTitle;

  return [firstLine, secondLine];
}

/** 간선의 유사도 점수 또는 공통 키워드 강도에 따라 선 두께를 계산한다. */
export function edgeWidth(edge) {
  const score = Number(edge?.score);

  if (Number.isFinite(score) && score > 0) {
    return Number((1.1 + clamp(score, 0, 1) * 2.1).toFixed(2));
  }

  const strength = Math.max(1, Number(edge?.strength) || 1);

  return Number((1.1 + Math.min(strength, 3) * 0.55).toFixed(2));
}

/** 간선 유사도 점수와 캔버스 테마를 반영해 기본 간선 투명도를 계산한다. */
export function edgeBaseOpacity(edge, canvasTheme = 'dark') {
  if (edge?.isExplicit) {
    return canvasTheme === 'light' ? 0.78 : 0.72;
  }

  const score = Number(edge?.score);
  const normalized = Number.isFinite(score) && score > 0 ? clamp(score, 0, 1) : 0.35;

  if (canvasTheme === 'light') {
    return Number((0.26 + normalized * 0.36).toFixed(2));
  }

  return Number((0.2 + normalized * 0.34).toFixed(2));
}

/** 그래프에서 연결 수를 노드 반지름으로 자연스럽게 환산한다. */
export function graphNodeRadius(connectionCount) {
  const count = Math.max(0, Number(connectionCount) || 0);

  return Math.min(20, Math.max(8, 8 + Math.log2(count + 1) * 3));
}

/** 명시적 링크의 화살촉 삼각형 좌표를 계산한다. */
export function createArrowPoints(tipX, tipY, baseX, baseY, ux, uy) {
  const normalX = -uy;
  const normalY = ux;
  const halfHeight = ARROW_HEIGHT / 2;

  return [
    `${tipX},${tipY}`,
    `${baseX + normalX * halfHeight},${baseY + normalY * halfHeight}`,
    `${baseX - normalX * halfHeight},${baseY - normalY * halfHeight}`,
  ].join(' ');
}

/** 태그 배지 색상 메타데이터를 반환한다. */
export function tagMeta(tag) {
  return TAG_META[tag] ?? { color: PRIMARY, bg: PRIMARY_SOFT, text: '#14748D' };
}

/** Set에서 특정 값을 토글한 새 Set을 반환한다. */
export function toggleSetValue(previous, value) {
  const next = new Set(previous);

  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }

  return next;
}

/** 숫자를 최소·최대 범위 안으로 제한한다. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

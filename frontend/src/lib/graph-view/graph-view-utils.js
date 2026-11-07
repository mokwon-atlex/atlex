export const SVG_W = 840;
export const SVG_H = 640;
export const ARROW_LENGTH = 20;
export const ARROW_HEIGHT = 16;
export const PRIMARY = '#66C0DC';
export const PRIMARY_SOFT = '#E8F7FB';
export const CANVAS_BG = '#F8F8F5';

const TAG_META = {
  철학: { color: '#6252D9', bg: '#ECE9FF', text: '#4C36B8' },
  디자인: { color: '#159D91', bg: '#DCF8F4', text: '#0D766E' },
  개발: { color: '#E25555', bg: '#FDE2E2', text: '#B91C1C' },
  AI: { color: '#2F7ED8', bg: '#E0EEFF', text: '#1D4ED8' },
  UX: { color: '#7B5CE1', bg: '#EEE8FF', text: '#5B35C8' },
  일상: { color: '#9AA3AF', bg: '#F3F4F6', text: '#374151' },
};

/** API 응답에서 계산한 노드 고유 색상을 반환한다. */
export function nodeColor(post) {
  return post.color ?? PRIMARY;
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

export function edgeWidth() {
  return 1.35;
}

/** 그래프에서 연결 수를 노드 반지름으로 자연스럽게 환산한다. */
export function graphNodeRadius(connectionCount) {
  const count = Math.max(0, Number(connectionCount) || 0);

  return Math.min(20, Math.max(8, 8 + Math.log2(count + 1) * 3));
}

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

export function tagMeta(tag) {
  return TAG_META[tag] ?? { color: PRIMARY, bg: PRIMARY_SOFT, text: '#14748D' };
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

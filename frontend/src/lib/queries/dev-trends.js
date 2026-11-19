const GEEKNEWS_RSS_URL = 'https://news.hada.io/rss/news';
const RSS_REVALIDATE_SECONDS = 1800;
const RSS_TIMEOUT_MS = 4000;

/**
 * 외부 RSS 조회가 실패하거나 비어 있을 때 2번 배너에 표시하는 기본 기술 트렌드 폴백 목록.
 */
export const FALLBACK_DEV_TRENDS = [
  {
    id: 'fallback-ai-agent',
    title: 'AI Agent 워크플로우와 도구 호출(Tool Use) 설계 패턴',
    summary: '단일 프롬프트를 넘어 검색·코드 실행·검증을 연결하는 에이전트 아키텍처 트렌드',
    url: '/?tag=AI',
    source: '추천 기술 이슈',
    publishedAt: '큐레이션',
    isExternal: false,
  },
  {
    id: 'fallback-knowledge-graph',
    title: '지식 그래프 기반 문서 연결과 RAG 검색 정확도 개선',
    summary: '태그·본문 문맥을 그래프 구조로 엮어 연관 기술 아티클을 탐색하는 방법',
    url: '/graph',
    source: '추천 기술 이슈',
    publishedAt: '큐레이션',
    isExternal: false,
  },
  {
    id: 'fallback-react-rsc',
    title: 'Next.js App Router와 Server Components 실전 캐싱 전략',
    summary: '서버 렌더링과 데이터 재검증(revalidate)을 조합한 초기 로딩 최적화',
    url: '/?tag=Next.js',
    source: '추천 기술 이슈',
    publishedAt: '큐레이션',
    isExternal: false,
  },
  {
    id: 'fallback-spring-vt',
    title: 'Spring Boot와 Virtual Threads로 고동시성 I/O 처리하기',
    summary: '블로킹 코드의 단순함을 유지하면서 처리량을 높이는 Java 백엔드 실무 사례',
    url: '/?tag=Spring',
    source: '추천 기술 이슈',
    publishedAt: '큐레이션',
    isExternal: false,
  },
];

/**
 * XML/HTML 엔티티와 CDATA 래퍼를 일반 텍스트로 디코딩한다.
 *
 * @param {string} raw 원시 문자열
 * @returns {string} 정리된 평문 문자열
 */
function decodeXmlText(raw) {
  if (!raw) return '';

  const withoutCdata = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  const withoutTags = withoutCdata.replace(/<[^>]*>/g, ' ');

  return withoutTags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * XML 블록 내부에서 지정한 태그 중 첫 번째로 일치하는 본문을 추출한다.
 *
 * @param {string} block XML 항목 블록
 * @param {string[]} tagNames 우선순위 순 태그명 목록
 * @returns {string} 추출된 텍스트
 */
function extractTagValue(block, tagNames) {
  for (const tagName of tagNames) {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
    const match = block.match(regex);
    if (match?.[1]) {
      return decodeXmlText(match[1]);
    }
  }
  return '';
}

/**
 * Atom `<link href="..." />` 또는 RSS `<link>...</link>`에서 안전한 HTTP(S) URL을 추출한다.
 *
 * @param {string} block XML 항목 블록
 * @returns {string | null} 검증된 외부 URL 또는 null
 */
function extractSafeLink(block) {
  const hrefMatch = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i);
  const tagValue = extractTagValue(block, ['link']);
  const candidate = (hrefMatch?.[1] || tagValue || '').trim();

  if (!candidate) return null;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 날짜 문자열을 `MM.DD` 형식의 짧은 표시 문자열로 변환한다.
 *
 * @param {string} rawDate ISO 또는 RFC 2822 날짜 문자열
 * @returns {string} 포맷된 날짜 문자열
 */
function formatShortDate(rawDate) {
  if (!rawDate) return '최신';
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return '최신';

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}.${day}`;
}

/**
 * Atom(`<entry>`) 또는 RSS 2.0(`<item>`) XML 문자열을 배너용 기술 트렌드 목록으로 파싱한다.
 *
 * @param {string} xmlText RSS/Atom XML 응답 본문
 * @param {number} [limit=4] 최대 반환 개수
 * @returns {Array<{
 *   id: string,
 *   title: string,
 *   summary: string,
 *   url: string,
 *   source: string,
 *   publishedAt: string,
 *   isExternal: boolean,
 * }>} 파싱된 항목 목록
 */
export function parseRssFeed(xmlText, limit = 4) {
  if (!xmlText || typeof xmlText !== 'string') return [];

  const entryMatches = xmlText.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  const itemMatches = entryMatches.length > 0 ? entryMatches : (xmlText.match(/<item\b[\s\S]*?<\/item>/gi) ?? []);

  const parsed = [];
  for (let index = 0; index < itemMatches.length && parsed.length < limit; index += 1) {
    const block = itemMatches[index];
    const title = extractTagValue(block, ['title']);
    const url = extractSafeLink(block);

    if (!title || !url) continue;

    const rawSummary = extractTagValue(block, ['summary', 'description', 'content']);
    const summary = rawSummary.length > 90 ? `${rawSummary.slice(0, 89).trimEnd()}…` : rawSummary;
    const rawDate = extractTagValue(block, ['published', 'updated', 'pubDate']);

    parsed.push({
      id: `rss-${index}-${url}`,
      title,
      summary,
      url,
      source: 'GeekNews',
      publishedAt: formatShortDate(rawDate),
      isExternal: true,
    });
  }

  return parsed;
}

/**
 * 메인 배너 2페이지에 표시할 주요 개발 이슈·기술 트렌드를 조회한다.
 * 외부 RSS 조회가 실패하거나 항목이 비어 있으면 큐레이션된 폴백 목록을 반환한다.
 *
 * @param {number} [limit=4] 최대 표시 개수
 * @returns {Promise<{ items: Array<object>, isFallback: boolean, sourceLabel: string }>} 트렌드 목록과 폴백 여부
 */
export async function loadDevTrends(limit = 4) {
  try {
    const response = await fetch(GEEKNEWS_RSS_URL, {
      headers: {
        Accept: 'application/atom+xml, application/rss+xml, application/xml, text/xml',
      },
      next: { revalidate: RSS_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(RSS_TIMEOUT_MS),
    });

    if (!response.ok) {
      return {
        items: FALLBACK_DEV_TRENDS.slice(0, limit),
        isFallback: true,
        sourceLabel: '추천 기술 이슈',
      };
    }

    const xmlText = await response.text();
    const items = parseRssFeed(xmlText, limit);

    if (items.length === 0) {
      return {
        items: FALLBACK_DEV_TRENDS.slice(0, limit),
        isFallback: true,
        sourceLabel: '추천 기술 이슈',
      };
    }

    return {
      items,
      isFallback: false,
      sourceLabel: 'GeekNews RSS',
    };
  } catch {
    return {
      items: FALLBACK_DEV_TRENDS.slice(0, limit),
      isFallback: true,
      sourceLabel: '추천 기술 이슈',
    };
  }
}

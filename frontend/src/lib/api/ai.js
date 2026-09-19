import { apiClient } from '@/lib/api/client';

/**
 * 게시글 제목 자동완성 추천 API를 호출합니다.
 * @param {Object} params
 * @param {string} params.currentTitle 현재까지 입력된 제목
 * @param {string} [params.category] 선택된 카테고리
 * @param {string[]} [params.tags] 입력된 태그 목록
 * @param {AbortSignal} [signal] 요청 취소 시그널
 * @returns {Promise<{ suggestion: string }>}
 */
export async function fetchTitleAiSuggestion({ currentTitle, category, tags }, signal) {
  return apiClient.post('/ai/suggest/title', { currentTitle, category, tags }, { signal });
}

/**
 * 게시글 본문 다음 단락 추천 API를 호출합니다.
 * @param {Object} params
 * @param {string} [params.title] 글 제목
 * @param {string} [params.category] 카테고리
 * @param {string[]} [params.tags] 태그 목록
 * @param {string} params.currentWriting 직전 작성 문맥/단락
 * @param {AbortSignal} [signal] 요청 취소 시그널
 * @returns {Promise<{ suggestion: string }>}
 */
export async function fetchParagraphAiSuggestion({ title, category, tags, currentWriting }, signal) {
  return apiClient.post('/ai/suggest/paragraph', { title, category, tags, currentWriting }, { signal });
}

/**
 * 게시글 본문 요약(Description) 추천 API를 호출합니다.
 * @param {Object} params
 * @param {string} [params.title] 글 제목
 * @param {string} params.content 본문 내용
 * @param {AbortSignal} [signal] 요청 취소 시그널
 * @returns {Promise<{ suggestion: string }>}
 */
export async function fetchDescriptionAiSuggestion({ title, content }, signal) {
  return apiClient.post('/ai/suggest/description', { title, content }, { signal });
}

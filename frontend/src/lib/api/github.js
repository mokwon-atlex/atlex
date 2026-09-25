/**
 * @fileoverview GitHub 계정 연동 및 저장소 백업 설정 API 모듈입니다.
 */

import { apiClient } from '@/lib/api/client';

/**
 * GitHub OAuth 로그인 인가 URL을 조회합니다.
 * @returns {Promise<{ url: string }>}
 */
export function fetchGitHubOAuthUrl() {
  return apiClient.get('/github/oauth/url');
}

/**
 * GitHub OAuth 인가 코드(code) 및 CSRF 방지 state로 연동을 완료합니다.
 * @param {string} code GitHub 인가 코드
 * @param {string} [state] CSRF 방어용 state 토큰
 * @returns {Promise<import('./github').GitHubConfig>}
 */
export function connectGitHub(code, state) {
  return apiClient.post('/github/oauth/callback', { code, state });
}

/**
 * 현재 사용자의 GitHub 연동 상태 및 백업 설정을 조회합니다.
 * @returns {Promise<import('./github').GitHubConfig>}
 */
export function fetchGitHubConfig() {
  return apiClient.get('/github/config');
}

/**
 * GitHub 동기화 설정(저장소, 브랜치, 디렉터리, 삭제옵션, 활성화)을 변경합니다.
 * @param {object} payload
 * @param {string} [payload.repositoryName]
 * @param {string} [payload.branchName]
 * @param {string} [payload.directoryPath]
 * @param {'DELETE_FILE'|'KEEP_FILE'} [payload.deleteOption]
 * @param {boolean} [payload.isEnabled]
 * @returns {Promise<import('./github').GitHubConfig>}
 */
export function updateGitHubConfig(payload) {
  return apiClient.patch('/github/config', payload);
}

/**
 * GitHub 계정 연동을 해제하고 저장된 토큰을 파기합니다.
 * @returns {Promise<void>}
 */
export function disconnectGitHub() {
  return apiClient.delete('/github/config');
}

/**
 * 연동된 계정에서 접근 가능한 GitHub 저장소 목록을 조회합니다.
 * @returns {Promise<Array<{ name: string, fullName: string, description: string, isPrivate: boolean, defaultBranch: string }>>}
 */
export function fetchGitHubRepositories() {
  return apiClient.get('/github/repositories');
}

/**
 * 최근 동기화 이력 로그를 조회합니다.
 * @returns {Promise<Array<object>>}
 */
export function fetchGitHubSyncLogs() {
  return apiClient.get('/github/sync/logs');
}

/**
 * 실패한 동기화 항목을 재시도합니다.
 * @param {number} logId 동기화 로그 ID
 * @returns {Promise<object>}
 */
export function retryGitHubSync(logId) {
  return apiClient.post(`/github/sync/retry/${logId}`);
}

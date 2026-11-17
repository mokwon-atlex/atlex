// 팔로우 등록·해제 및 팔로워/팔로잉 목록 조회 API 호출 레이어.
import { apiClient } from '@/lib/api/client';

/**
 * 대상 사용자를 팔로우한다.
 *
 * @param {string} userId 대상 사용자 아이디
 * @returns {Promise<{ userId: string, following: boolean, followerCount: number, followingCount: number }>}
 */
export function followUser(userId) {
  return apiClient.post(`/profiles/${encodeURIComponent(userId)}/follow`);
}

/**
 * 대상 사용자 팔로우를 해제한다.
 *
 * @param {string} userId 대상 사용자 아이디
 * @returns {Promise<{ userId: string, following: boolean, followerCount: number, followingCount: number }>}
 */
export function unfollowUser(userId) {
  return apiClient.delete(`/profiles/${encodeURIComponent(userId)}/follow`);
}

/**
 * 대상 사용자의 팔로워 목록을 조회한다.
 *
 * @param {string} userId 대상 사용자 아이디
 * @returns {Promise<Array<{ id: number, userId: string, name: string, profileImage: string | null, info: string | null }>>}
 */
export function fetchFollowers(userId) {
  return apiClient.get(`/profiles/${encodeURIComponent(userId)}/followers`);
}

/**
 * 대상 사용자가 팔로우하는 사용자 목록을 조회한다.
 *
 * @param {string} userId 대상 사용자 아이디
 * @returns {Promise<Array<{ id: number, userId: string, name: string, profileImage: string | null, info: string | null }>>}
 */
export function fetchFollowing(userId) {
  return apiClient.get(`/profiles/${encodeURIComponent(userId)}/following`);
}

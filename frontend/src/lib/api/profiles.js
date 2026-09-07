// 프로필 raw API 호출. envelope 만 풀린 응답을 그대로 반환한다.
// 백엔드 endpoint 가 변경되면 이 파일의 URL/메서드만 수정한다.

import { apiClient } from "@/lib/api/client";

// GET /profiles/{userId} — userId 는 로그인 ID 문자열이다.
// 응답: ApiProfile ({ id, userId, name, profileImage, info, follow, follower, ... }).
export function fetchProfileByUserId(userId) {
  return apiClient.get(`/profiles/${userId}`);
}

// PATCH /profiles/{userId} — 프로필 수정. Authorization 헤더 필요.
// payload: { name?, profileImage?, info? }
export function updateProfile(userId, body) {
  return apiClient.patch(`/profiles/${userId}`, body);
}

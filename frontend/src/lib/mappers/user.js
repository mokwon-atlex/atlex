// API User 엔티티를 UI shape 으로 변환하는 순수 매퍼.
// 비동기 호출 금지. 백엔드 필드명이 바뀌면 input 부분만 수정한다.

// input: fetchProfileByUserId 응답 (ApiProfile: { id, userId, name, profileImage, info, ... })
// output: 유저 블로그 홈 프로필 shape (CategoryBlogHomeContent 의 profile)
// 미구현 필드(stats: 팔로워/팔로잉 등, quickActions)는 임시 mock 값으로 채워둔다 — 백엔드 추가 시 교체.
export function toBlogHomeProfile(apiProfile) {
  return {
    userId: apiProfile.userId,
    nickname: apiProfile.name,
    // 소개글(info)이 있으면 쓰고, 없으면 안내 문구.
    bio: apiProfile.info || "아직 소개글이 없습니다.",
    stats: [
      { id: "followers", label: "팔로워", value: "0" },
      { id: "following", label: "팔로잉", value: "0" },
      { id: "posts", label: "게시글", value: "0" },
    ],
    quickActions: [
      { id: "follow", label: "팔로우", tone: "accent" },
      { id: "category", label: "카테고리", tone: "neutral" },
      { id: "graph", label: "그래프 보기", tone: "soft" },
      { id: "option", label: "블로그 옵션", tone: "neutral" },
    ],
  };
}

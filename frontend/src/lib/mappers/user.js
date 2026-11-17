// API User 엔티티를 UI shape 으로 변환하는 순수 매퍼.
// 비동기 호출 금지. 백엔드 필드명이 바뀌면 input 부분만 수정한다.

// input: fetchProfileByUserId 응답 (ApiProfile: { id, userId, name, profileImage, info, followerCount, followingCount, following })
// output: 유저 블로그 홈 프로필 shape (CategoryBlogHomeContent 의 profile)
export function toBlogHomeProfile(apiProfile) {
  const followerCount = Number(apiProfile.followerCount ?? 0);
  const followingCount = Number(apiProfile.followingCount ?? 0);

  return {
    userId: apiProfile.userId,
    nickname: apiProfile.name,
    // 소개글(info)이 있으면 쓰고, 없으면 안내 문구.
    bio: apiProfile.info || '아직 소개글이 없습니다.',
    followerCount,
    followingCount,
    following: Boolean(apiProfile.following),
    stats: [
      { id: 'followers', label: '팔로워', value: followerCount.toLocaleString() },
      { id: 'following', label: '팔로잉', value: followingCount.toLocaleString() },
      { id: 'posts', label: '게시글', value: '0' },
    ],
    quickActions: [
      { id: 'follow', label: '팔로우', tone: 'accent' },
      { id: 'category', label: '카테고리', tone: 'neutral' },
      { id: 'graph', label: '그래프 보기', tone: 'soft' },
      { id: 'option', label: '블로그 옵션', tone: 'neutral' },
    ],
  };
}

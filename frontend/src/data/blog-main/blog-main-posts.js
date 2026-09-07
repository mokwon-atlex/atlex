// 블로그 메인 화면 툴바용 정적 옵션(필터/기간). 게시글 자체는 API(loadMainPosts)로 받는다.
export const blogMainFilters = [
  {
    id: "trending",
    label: "인기 글",
    description: "많이 읽히거나 반응이 좋은 글을 모아둔 보기입니다.",
  },
  {
    id: "latest",
    label: "최신 글",
    description: "최근에 작성된 글을 시간순으로 확인하는 보기입니다.",
  },
  {
    id: "feed",
    label: "피드",
    description: "전체 글을 한 화면에서 훑어볼 수 있는 보기입니다.",
  },
];

export const blogMainPeriods = [
  { id: "week", label: "이번 주" },
  { id: "month", label: "이번 달" },
  { id: "all", label: "전체" },
];

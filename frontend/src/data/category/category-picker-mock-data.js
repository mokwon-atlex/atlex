export const ALL_CATEGORY_ID = "all";

export const categoryPickerCategories = [
  {
    id: ALL_CATEGORY_ID,
    label: "전체 글",
    description: "블로그 홈의 전체 게시물을 한 번에 확인합니다.",
  },
  {
    id: "ui-lab",
    label: "UI 실험",
    description: "레이아웃과 컴포넌트 인터랙션을 다듬는 기록입니다.",
    postIds: [1],
  },
  {
    id: "work-log",
    label: "작업 로그",
    description: "작업 과정과 회고를 짧은 메모처럼 남깁니다.",
    postIds: [2],
  },
  {
    id: "private-notes",
    label: "비공개 메모",
    description: "아직 공개하지 않은 초안과 개인 메모를 모아둡니다.",
    postIds: [3],
  },
  {
    id: "archive",
    label: "아카이브 정리",
    description: "발행한 글과 정리 메모를 다시 묶어보는 카테고리입니다.",
    postIds: [1, 2],
  },
  {
    id: "design-notes",
    label: "디자인 메모",
    description: "작은 시각적 조정과 레이아웃 메모를 정리합니다.",
    postIds: [1, 3],
  },
  {
    id: "weekly-review",
    label: "주간 회고",
    description: "한 주 동안 쌓인 기록을 다시 훑어보는 공간입니다.",
    postIds: [2, 3],
  },
  {
    id: "component-study",
    label: "컴포넌트 스터디",
    description: "공통 컴포넌트 사용 방식과 패턴을 모아둡니다.",
    postIds: [1],
  },
  {
    id: "release-notes",
    label: "릴리즈 메모",
    description: "배포 전후로 확인한 내용을 짧게 남깁니다.",
    postIds: [2],
  },
  {
    id: "reference-box",
    label: "레퍼런스 수집",
    description: "나중에 다시 참고할 만한 자료를 모아둡니다.",
    postIds: [1, 2, 3],
  },
  {
    id: "draft-box",
    label: "초안 박스",
    description: "완성 전 아이디어와 메모를 보관하는 공간입니다.",
    postIds: [3],
  },
  {
    id: "ready-soon",
    label: "준비 중",
    description: "아직 등록된 게시물이 없어 빈 상태를 함께 확인할 수 있습니다.",
    postIds: [],
  },
];

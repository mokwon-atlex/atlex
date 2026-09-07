// 오른쪽 툴 레일과 사이드 패널에 사용할 도구 트리입니다.
export const postEditorToolCategories = [
  {
    id: "text-style",
    railLabel: "1",
    railIcon: "Type",
    title: "글씨 체",
    caption: "기본 텍스트 스타일을 고르는 영역",
    groups: [
      {
        id: "font-style",
        title: "기본 스타일",
        description: "문장 표현을 조정하는 기본 서식입니다.",
        items: ["볼드", "이탤릭", "밑줄", "취소선"],
      },
      {
        id: "font-color",
        title: "색상",
        description: "텍스트와 배경색을 지정하는 영역입니다.",
        items: ["글자색", "배경색", "강조 배경", "투명 배경"],
      },
      {
        id: "font-align",
        title: "정렬",
        description: "문장과 문단 정렬을 바꾸는 영역입니다.",
        items: ["왼쪽 정렬", "가운데 정렬", "오른쪽 정렬", "양쪽 정렬"],
      },
    ],
  },
  {
    id: "heading",
    railLabel: "2",
    railIcon: "Heading",
    title: "제목/문단",
    caption: "문단 구조를 빠르게 바꾸는 영역",
    groups: [
      {
        id: "heading-level",
        title: "제목",
        description: "문서 구조를 나누는 제목 레벨입니다.",
        items: ["제목 1", "제목 2", "제목 3"],
      },
      {
        id: "paragraph-type",
        title: "문단",
        description: "본문과 강조 문단 구성을 고르는 영역입니다.",
        items: ["본문", "리드 문단", "인용문", "캡션"],
      },
      {
        id: "structure-block",
        title: "구조 요소",
        description: "문단 사이에 들어가는 구조 블록입니다.",
        items: ["구분선", "토글 섹션", "체크리스트"],
      },
    ],
  },
  {
    id: "insert-edit",
    railLabel: "3",
    railIcon: "PenLine",
    title: "삽입/편집",
    caption: "콘텐츠 삽입과 편집 기능을 묶은 영역",
    groups: [
      {
        id: "insert-basic",
        title: "삽입",
        description: "외부 리소스와 미디어를 추가합니다.",
        items: ["링크", "이미지", "파일", "표"],
      },
      {
        id: "insert-advanced",
        title: "고급 블록",
        description: "개발과 수식 관련 블록을 넣습니다.",
        items: ["코드 블록", "수식(LaTeX)", "알림 박스", "구분 영역"],
      },
      {
        id: "edit-actions",
        title: "편집",
        description: "되돌리기와 초기화 같은 편집 기능입니다.",
        items: ["실행 취소", "다시 실행", "서식 제거"],
      },
    ],
  },
];

// 글 작성 화면의 카테고리 선택 UI 용 정적 목록(placeholder).
//
// ⚠️ 임시 데이터입니다.
// 백엔드에 카테고리 기능이 아직 없어(GET 카테고리 엔드포인트 미오픈, 매칭 안 되는 경로를 401 로 응답),
// 실제 목록을 불러올 수 없다. 이전에는 일상/개발/회고(id 1/2/3) 를 두었으나, 백엔드 DB 에 해당
// categoryId 가 없어 글 게시 시 POST /posts 가 404 CATEGORY_NOT_FOUND 로 실패했다.
// → 백엔드 카테고리가 열리기 전까지는 안전하게 '미분류'(categoryId 미전송) 만 제공한다.
// 백엔드가 열리면 useUserBlogCategories(가칭) 훅으로 교체하고 이 파일은 삭제한다.
// (id 는 백엔드 categoryId(Long) 와 동일한 의미)
export const postEditorCategories = [
  { id: null, name: '미분류' },
];

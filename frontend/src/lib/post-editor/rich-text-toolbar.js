import {
  getSelectedText,
  normalizeUrl,
  parsePositiveInteger,
  restoreSelection,
} from "@/lib/post-editor/rich-text-utils";

// 툴바 UI는 버튼 라벨만 알고 있고, 실제로 어떤 TipTap 명령을 호출할지는 이 파일이 맡는다.
// 그래서 "라벨 -> 실행 함수", "라벨 -> 활성 상태 체크"를 같은 기준으로 모아 둔다.
//
// 이 객체는 prompt 없이 바로 실행할 수 있는 명령 모음이다.
// 예를 들어 볼드, 정렬, 제목 전환처럼 추가 입력이 필요 없는 버튼이 여기에 들어간다.
export const SIMPLE_TOOLBAR_ACTIONS = {
  볼드: (editor) => editor.chain().focus().toggleBold().run(),
  이탤릭: (editor) => editor.chain().focus().toggleItalic().run(),
  밑줄: (editor) => editor.chain().focus().toggleUnderline().run(),
  취소선: (editor) => editor.chain().focus().toggleStrike().run(),
  "왼쪽 정렬": (editor) => editor.chain().focus().setTextAlign("left").run(),
  "가운데 정렬": (editor) => editor.chain().focus().setTextAlign("center").run(),
  "오른쪽 정렬": (editor) => editor.chain().focus().setTextAlign("right").run(),
  "양쪽 정렬": (editor) => editor.chain().focus().setTextAlign("justify").run(),
  "제목 1": (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  "제목 2": (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  "제목 3": (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  본문: (editor) => editor.chain().focus().setParagraph().run(),
  "리드 문단": (editor) => editor.chain().focus().toggleLeadParagraph().run(),
  인용문: (editor) => editor.chain().focus().toggleBlockquote().run(),
  캡션: (editor) => editor.chain().focus().toggleCaptionParagraph().run(),
  구분선: (editor) => editor.chain().focus().setHorizontalRule().run(),
  체크리스트: (editor) => editor.chain().focus().toggleTaskList().run(),
  "코드 블록": (editor) => editor.chain().focus().toggleCodeBlock().run(),
  "실행 취소": (editor) => editor.chain().focus().undo().run(),
  "다시 실행": (editor) => editor.chain().focus().redo().run(),
  "서식 제거": (editor) => editor.chain().focus().unsetAllMarks().clearNodes().run(),
};

// 사이드바 버튼이 눌린 상태인지 판단하는 규칙도 같은 라벨 기준으로 관리한다.
// 컴포넌트 쪽은 TipTap의 node/mark 이름을 몰라도 되고,
// 여기서만 "이 라벨은 어떤 상태를 봐야 active 인가?"를 책임진다.
const TOOLBAR_ACTIVE_CHECKERS = {
  볼드: (editor) => editor.isActive("bold"),
  이탤릭: (editor) => editor.isActive("italic"),
  밑줄: (editor) => editor.isActive("underline"),
  취소선: (editor) => editor.isActive("strike"),
  "왼쪽 정렬": (editor) => editor.isActive({ textAlign: "left" }),
  "가운데 정렬": (editor) => editor.isActive({ textAlign: "center" }),
  "오른쪽 정렬": (editor) => editor.isActive({ textAlign: "right" }),
  "양쪽 정렬": (editor) => editor.isActive({ textAlign: "justify" }),
  "제목 1": (editor) => editor.isActive("heading", { level: 1 }),
  "제목 2": (editor) => editor.isActive("heading", { level: 2 }),
  "제목 3": (editor) => editor.isActive("heading", { level: 3 }),
  본문: (editor) => editor.isActive("paragraph"),
  "리드 문단": (editor) => editor.isActive("leadParagraph"),
  인용문: (editor) => editor.isActive("blockquote"),
  캡션: (editor) => editor.isActive("captionParagraph"),
  링크: (editor) => editor.isActive("link"),
  이미지: (editor) => editor.isActive("image"),
  표: (editor) => editor.isActive("table"),
  "코드 블록": (editor) => editor.isActive("codeBlock"),
  "수식(LaTeX)": (editor) => editor.isActive("mathBlock"),
  "알림 박스": (editor) => editor.isActive("calloutBox"),
  "구분 영역": (editor) => editor.isActive("sectionBlock"),
  "토글 섹션": (editor) => editor.isActive("detailsBlock"),
  체크리스트: (editor) => editor.isActive("taskList"),
};

export function getItemActiveState(editor, itemLabel) {
  // 아직 체크 규칙이 없는 버튼은 false 로 처리해서 UI가 안전하게 동작하게 둔다.
  return TOOLBAR_ACTIVE_CHECKERS[itemLabel]?.(editor) ?? false;
}

// 토글 섹션은 제목과 본문을 함께 받아 detailsBlock 노드로 넣는다.
function promptDetailsBlock(editor, selection) {
  const sectionTitle = window.prompt("토글 섹션 제목을 입력하세요.", "토글 제목");

  if (sectionTitle === null) {
    return;
  }

  const sectionBody = window.prompt(
    "토글 섹션 기본 내용을 입력하세요.",
    "토글 내용을 입력하세요.",
  );

  if (sectionBody === null) {
    return;
  }

  restoreSelection(editor, selection)
    .insertDetailsBlock({
      content: sectionBody,
      title: sectionTitle,
    })
    .run();
}

// 링크 버튼은 세 가지 상황을 처리한다.
// 1. 주소를 비우면 기존 링크 제거
// 2. 선택한 텍스트나 기존 링크가 있으면 그 범위의 링크만 수정
// 3. 아무것도 선택하지 않았으면 표시할 텍스트를 새로 받아 링크 삽입
function promptLink(editor, selection) {
  const currentHref = editor.getAttributes("link").href ?? "";
  const nextHrefInput = window.prompt(
    "링크 주소를 입력하세요. 비워두면 링크를 제거합니다.",
    currentHref,
  );

  if (nextHrefInput === null) {
    return;
  }

  const nextHref = normalizeUrl(nextHrefInput);

  if (!nextHref) {
    // 링크 주소가 비어 있으면 "링크 제거" 요청으로 본다.
    restoreSelection(editor, selection).extendMarkRange("link").unsetLink().run();
    return;
  }

  const selectedText = getSelectedText(editor, selection);

  if (selectedText || editor.isActive("link")) {
    // 선택 범위가 있거나 커서가 기존 링크 안에 있으면 새 링크를 만드는 대신 주소만 교체한다.
    restoreSelection(editor, selection)
      .extendMarkRange("link")
      .setLink({ href: nextHref })
      .run();
    return;
  }

  // 선택한 텍스트가 없으면 사용자가 바로 읽을 수 있는 링크 문구도 함께 만든다.
  const linkLabel = window.prompt(
    "링크에 표시할 텍스트를 입력하세요.",
    nextHref,
  );

  if (linkLabel === null) {
    return;
  }

  restoreSelection(editor, selection)
    .insertContent({
      type: "text",
      text: linkLabel.trim() || nextHref,
      marks: [{ type: "link", attrs: { href: nextHref } }],
    })
    .run();
}

// 이미지는 URL 과 alt 텍스트를 받아 현재 선택 위치에 삽입한다.
function promptImage(editor, selection) {
  const imageSource = window.prompt(
    "이미지 주소를 입력하세요.",
    "https://",
  );

  if (imageSource === null) {
    return;
  }

  const src = normalizeUrl(imageSource);

  if (!src) {
    return;
  }

  const altText =
    window.prompt("대체 텍스트를 입력하세요.", "이미지 설명") ?? "";

  restoreSelection(editor, selection)
    .setImage({ alt: altText.trim(), src })
    .run();
}

// 파일 첨부는 별도 업로드가 아니라 링크 텍스트를 만들어 주는 방식이다.
// 그래서 사용자가 보는 문구와 실제 이동할 URL 을 같이 만든다.
function promptFileLink(editor, selection) {
  const fileUrlInput = window.prompt(
    "파일 주소를 입력하세요.",
    "https://",
  );

  if (fileUrlInput === null) {
    return;
  }

  const fileUrl = normalizeUrl(fileUrlInput);

  if (!fileUrl) {
    return;
  }

  const fileLabel = window.prompt(
    "파일 이름을 입력하세요.",
    "다운로드 파일",
  );

  if (fileLabel === null) {
    return;
  }

  restoreSelection(editor, selection)
    .insertContent([
      {
        type: "text",
        text: `파일: ${fileLabel.trim() || "다운로드 파일"}`,
        marks: [{ type: "link", attrs: { href: fileUrl } }],
      },
      {
        type: "text",
        text: " ",
      },
    ])
    .run();
}

// 표는 행/열 수만 입력받고, 나머지 구조는 에디터 기본 표 노드 규칙을 따른다.
// 비어 있거나 잘못된 입력이 와도 기본값 3x3 으로 안전하게 맞춘다.
function promptTable(editor, selection) {
  const rows = parsePositiveInteger(
    window.prompt("표 행 수를 입력하세요.", "3"),
    3,
  );
  const columns = parsePositiveInteger(
    window.prompt("표 열 수를 입력하세요.", "3"),
    3,
  );

  restoreSelection(editor, selection)
    .insertTable({
      cols: columns,
      rows,
      withHeaderRow: true,
    })
    .run();
}

// 수식 블록은 한 번에 하나의 LaTeX 문자열을 받아 블록 노드로 넣는다.
function promptMathBlock(editor, selection) {
  const latex = window.prompt(
    "LaTeX 수식을 입력하세요.",
    "\\frac{a}{b} = c",
  );

  if (latex === null || !latex.trim()) {
    return;
  }

  restoreSelection(editor, selection).insertMathBlock(latex.trim()).run();
}

// 알림 박스는 제목과 본문을 함께 받아 calloutBox 노드로 삽입한다.
function promptCalloutBox(editor, selection) {
  const boxTitle = window.prompt("알림 박스 제목을 입력하세요.", "알림");

  if (boxTitle === null) {
    return;
  }

  const boxBody = window.prompt(
    "알림 박스 내용을 입력하세요.",
    "알림 내용을 입력하세요.",
  );

  if (boxBody === null) {
    return;
  }

  restoreSelection(editor, selection)
    .insertCalloutBox({
      content: boxBody,
      title: boxTitle,
    })
    .run();
}

// 구분 영역은 큰 덩어리 콘텐츠를 눈에 띄게 묶고 싶을 때 쓰는 블록이다.
function promptSectionBlock(editor, selection) {
  const sectionTitle = window.prompt(
    "구분 영역 제목을 입력하세요.",
    "구분 영역",
  );

  if (sectionTitle === null) {
    return;
  }

  const sectionBody = window.prompt(
    "구분 영역 내용을 입력하세요.",
    "영역 내용을 입력하세요.",
  );

  if (sectionBody === null) {
    return;
  }

  restoreSelection(editor, selection)
    .insertSectionBlock({
      content: sectionBody,
      title: sectionTitle,
    })
    .run();
}

// prompt 가 필요한 버튼은 여기서 따로 관리한다.
// executeToolbarItem 쪽에서는 "추가 입력이 필요한가?"만 구분하고,
// 실제 어떤 prompt 함수를 부를지는 이 매핑으로 결정한다.
const PROMPT_TOOLBAR_ACTIONS = {
  "토글 섹션": promptDetailsBlock,
  링크: promptLink,
  이미지: promptImage,
  파일: promptFileLink,
  표: promptTable,
  "수식(LaTeX)": promptMathBlock,
  "알림 박스": promptCalloutBox,
  "구분 영역": promptSectionBlock,
};

export function executePromptToolbarAction(editor, itemLabel, selection) {
  // 매핑에 없는 버튼은 조용히 무시해서 미구현 버튼이 있어도 에디터가 깨지지 않게 둔다.
  PROMPT_TOOLBAR_ACTIONS[itemLabel]?.(editor, selection);
}

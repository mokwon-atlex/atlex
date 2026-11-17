import toast from 'react-hot-toast';
import { formatFileSize, uploadAttachmentFile, uploadImageFile } from '@/lib/api/files';
import {
  getSelectedText,
  normalizeUrl,
  parsePositiveInteger,
  restoreSelection,
} from '@/lib/post-editor/rich-text-utils';

// 툴바 UI는 버튼 라벨만 알고 있고, 실제로 어떤 TipTap 명령을 호출할지는 이 파일이 맡는다.
// 그래서 "라벨 -> 실행 함수", "라벨 -> 활성 상태 체크"를 같은 기준으로 모아 둔다.
//
// 이 객체는 prompt 없이 바로 실행할 수 있는 명령 모음이다.
// 예를 들어 볼드, 정렬, 제목 전환처럼 추가 입력이 필요 없는 버튼이 여기에 들어간다.
/**
 * 현재 커서 위치의 글이 코드 블록으로 빨려 들어가지 않도록,
 * 빈 문단이면 현재 위치에 전환하고, 내용이나 표가 있으면 그 아래에 새 코드 블록을 삽입한다.
 */
function insertCodeBlockBelow(editor) {
  const { $from } = editor.state.selection;

  if ($from.parent.type.name === 'codeBlock') {
    editor.chain().focus().toggleCodeBlock().run();
    return;
  }

  // 표 안에 커서가 있으면 표 바깥(표 바로 아래)에 코드 블록을 삽입한다.
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === 'table') {
      const insertPos = $from.after(depth);
      editor
        .chain()
        .focus()
        .insertContentAt(insertPos, { type: 'codeBlock' })
        .setTextSelection(insertPos + 1)
        .run();
      return;
    }
  }

  // 비어 있는 최상위 기본 문단이면 현재 줄을 코드 블록으로 전환한다.
  if ($from.depth === 1 && $from.parent.type.name === 'paragraph' && $from.parent.content.size === 0) {
    editor.chain().focus().setCodeBlock().run();
    return;
  }

  // 작성 중인 문단이나 다른 블록이 있으면 그 블록 아래에 새 코드 블록을 추가한다.
  const insertPos = $from.after(1);
  editor
    .chain()
    .focus()
    .insertContentAt(insertPos, { type: 'codeBlock' })
    .setTextSelection(insertPos + 1)
    .run();
}

export const SIMPLE_TOOLBAR_ACTIONS = {
  볼드: (editor) => editor.chain().focus().toggleBold().run(),
  이탤릭: (editor) => editor.chain().focus().toggleItalic().run(),
  밑줄: (editor) => editor.chain().focus().toggleUnderline().run(),
  취소선: (editor) => editor.chain().focus().toggleStrike().run(),
  '왼쪽 정렬': (editor) => editor.chain().focus().setTextAlign('left').run(),
  '가운데 정렬': (editor) => editor.chain().focus().setTextAlign('center').run(),
  '오른쪽 정렬': (editor) => editor.chain().focus().setTextAlign('right').run(),
  '양쪽 정렬': (editor) => editor.chain().focus().setTextAlign('justify').run(),
  '제목 1': (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  '제목 2': (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  '제목 3': (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  본문: (editor) => editor.chain().focus().setParagraph().run(),
  '리드 문단': (editor) => editor.chain().focus().toggleLeadParagraph().run(),
  인용문: (editor) => editor.chain().focus().toggleBlockquote().run(),
  캡션: (editor) => editor.chain().focus().toggleCaptionParagraph().run(),
  구분선: (editor) => editor.chain().focus().setHorizontalRule().run(),
  체크리스트: (editor) => editor.chain().focus().toggleTaskList().run(),
  '코드 블록': insertCodeBlockBelow,
  '실행 취소': (editor) => editor.chain().focus().undo().run(),
  '다시 실행': (editor) => editor.chain().focus().redo().run(),
  '서식 제거': (editor) => editor.chain().focus().unsetAllMarks().clearNodes().run(),
  '내 글 링크': (editor) => editor.commands.openPostLinkSearch?.(),
};

// 사이드바 버튼이 눌린 상태인지 판단하는 규칙도 같은 라벨 기준으로 관리한다.
// 컴포넌트 쪽은 TipTap의 node/mark 이름을 몰라도 되고,
// 여기서만 "이 라벨은 어떤 상태를 봐야 active 인가?"를 책임진다.
const TOOLBAR_ACTIVE_CHECKERS = {
  볼드: (editor) => editor.isActive('bold'),
  이탤릭: (editor) => editor.isActive('italic'),
  밑줄: (editor) => editor.isActive('underline'),
  취소선: (editor) => editor.isActive('strike'),
  '왼쪽 정렬': (editor) => editor.isActive({ textAlign: 'left' }),
  '가운데 정렬': (editor) => editor.isActive({ textAlign: 'center' }),
  '오른쪽 정렬': (editor) => editor.isActive({ textAlign: 'right' }),
  '양쪽 정렬': (editor) => editor.isActive({ textAlign: 'justify' }),
  '제목 1': (editor) => editor.isActive('heading', { level: 1 }),
  '제목 2': (editor) => editor.isActive('heading', { level: 2 }),
  '제목 3': (editor) => editor.isActive('heading', { level: 3 }),
  본문: (editor) => editor.isActive('paragraph'),
  '리드 문단': (editor) => editor.isActive('leadParagraph'),
  인용문: (editor) => editor.isActive('blockquote'),
  캡션: (editor) => editor.isActive('captionParagraph'),
  링크: (editor) => editor.isActive('link'),
  '내 글 링크': (editor) => editor.storage.postLink?.isOpen ?? false,
  이미지: (editor) => editor.isActive('image'),
  표: (editor) => editor.isActive('table'),
  '코드 블록': (editor) => editor.isActive('codeBlock'),
  '수식(LaTeX)': (editor) => editor.isActive('mathBlock'),
  '구분 영역': (editor) => editor.isActive('sectionBlock'),
  '토글 섹션': (editor) => editor.isActive('detailsBlock'),
  체크리스트: (editor) => editor.isActive('taskList'),
};

export function getItemActiveState(editor, itemLabel) {
  // 아직 체크 규칙이 없는 버튼은 false 로 처리해서 UI가 안전하게 동작하게 둔다.
  return TOOLBAR_ACTIVE_CHECKERS[itemLabel]?.(editor) ?? false;
}

// 토글 섹션은 제목과 본문을 함께 받아 detailsBlock 노드로 넣는다.
function promptDetailsBlock(editor, selection) {
  const sectionTitle = window.prompt('토글 섹션 제목을 입력하세요.', '토글 제목');

  if (sectionTitle === null) {
    return;
  }

  const sectionBody = window.prompt('토글 섹션 기본 내용을 입력하세요.', '토글 내용을 입력하세요.');

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
  const currentHref = editor.getAttributes('link').href ?? '';
  const nextHrefInput = window.prompt('링크 주소를 입력하세요. 비워두면 링크를 제거합니다.', currentHref);

  if (nextHrefInput === null) {
    return;
  }

  const nextHref = normalizeUrl(nextHrefInput);

  if (!nextHref) {
    // 링크 주소가 비어 있으면 "링크 제거" 요청으로 본다.
    restoreSelection(editor, selection).extendMarkRange('link').unsetLink().run();
    return;
  }

  const selectedText = getSelectedText(editor, selection);

  if (selectedText || editor.isActive('link')) {
    // 선택 범위가 있거나 커서가 기존 링크 안에 있으면 새 링크를 만드는 대신 주소만 교체한다.
    restoreSelection(editor, selection).extendMarkRange('link').setLink({ href: nextHref }).run();
    return;
  }

  // 선택한 텍스트가 없으면 사용자가 바로 읽을 수 있는 링크 문구도 함께 만든다.
  const linkLabel = window.prompt('링크에 표시할 텍스트를 입력하세요.', nextHref);

  if (linkLabel === null) {
    return;
  }

  restoreSelection(editor, selection)
    .insertContent({
      type: 'text',
      text: linkLabel.trim() || nextHref,
      marks: [{ type: 'link', attrs: { href: nextHref } }],
    })
    .run();
}

/**
 * 브라우저 파일 선택 대화상자를 열어 사용자가 선택한 파일을 반환한다.
 *
 * @param {string} accept 허용할 파일 MIME/확장자 필터
 * @returns {Promise<File | null>} 선택된 파일 (취소 시 null)
 */
function pickLocalFile(accept) {
  if (typeof document === 'undefined') {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    if (accept) {
      input.accept = accept;
    }

    let settled = false;
    const finish = (file) => {
      if (settled) {
        return;
      }
      settled = true;
      input.remove();
      resolve(file ?? null);
    };

    input.addEventListener('change', () => finish(input.files?.[0] ?? null), { once: true });
    input.addEventListener('cancel', () => finish(null), { once: true });

    input.style.display = 'none';
    document.body.appendChild(input);
    input.click();
  });
}

/**
 * 이미지 파일을 백엔드에 업로드한 뒤 에디터의 지정 위치(또는 현재 커서)에 삽입한다.
 *
 * @param {import('@tiptap/react').Editor} editor TipTap 에디터 인스턴스
 * @param {File} file 업로드할 이미지 파일
 * @param {{ from: number, to: number } | null} [selection] 복원할 선택 범위
 */
export async function uploadAndInsertImage(editor, file, selection = null) {
  if (!editor || !file) {
    return;
  }

  const toastId = toast.loading('이미지를 업로드하는 중입니다...');
  try {
    const uploaded = await uploadImageFile(file);
    const chain = selection ? restoreSelection(editor, selection) : editor.chain().focus();
    chain.setImage({ alt: uploaded.originalName || file.name, src: uploaded.url }).run();
    toast.success('이미지가 삽입되었습니다.', { id: toastId });
  } catch (error) {
    toast.error(error?.message || '이미지 업로드에 실패했습니다.', { id: toastId });
  }
}

/**
 * 일반 첨부파일을 백엔드에 업로드한 뒤 다운로드 링크를 에디터에 삽입한다.
 *
 * @param {import('@tiptap/react').Editor} editor TipTap 에디터 인스턴스
 * @param {File} file 업로드할 첨부파일
 * @param {{ from: number, to: number } | null} [selection] 복원할 선택 범위
 */
export async function uploadAndInsertAttachment(editor, file, selection = null) {
  if (!editor || !file) {
    return;
  }

  const toastId = toast.loading('파일을 업로드하는 중입니다...');
  try {
    const uploaded = await uploadAttachmentFile(file);
    const displayName = uploaded.originalName || file.name;
    const sizeText = formatFileSize(uploaded.size ?? file.size);
    const chain = selection ? restoreSelection(editor, selection) : editor.chain().focus();

    chain
      .insertContent([
        {
          type: 'text',
          text: `📎 ${displayName} (${sizeText})`,
          marks: [
            {
              type: 'link',
              attrs: {
                href: uploaded.url,
                download: displayName,
                'data-file-attachment': 'true',
              },
            },
          ],
        },
        {
          type: 'text',
          text: ' ',
        },
      ])
      .run();
    toast.success('파일이 첨부되었습니다.', { id: toastId });
  } catch (error) {
    toast.error(error?.message || '파일 업로드에 실패했습니다.', { id: toastId });
  }
}

// 이미지 버튼은 로컬 이미지 파일을 선택받아 서버에 업로드한 뒤 본문에 삽입한다.
async function promptImage(editor, selection) {
  const file = await pickLocalFile('image/jpeg,image/png,image/gif,image/webp');
  if (!file) {
    return;
  }

  await uploadAndInsertImage(editor, file, selection);
}

// 파일 버튼은 로컬 파일을 선택받아 서버에 업로드한 뒤 다운로드 링크를 본문에 삽입한다.
async function promptFileLink(editor, selection) {
  const file = await pickLocalFile();
  if (!file) {
    return;
  }

  await uploadAndInsertAttachment(editor, file, selection);
}

// 표는 행/열 수만 입력받고, 나머지 구조는 에디터 기본 표 노드 규칙을 따른다.
// 비어 있거나 잘못된 입력이 와도 기본값 3x3 으로 안전하게 맞춘다.
function promptTable(editor, selection) {
  const rows = parsePositiveInteger(window.prompt('표 행 수를 입력하세요.', '3'), 3);
  const columns = parsePositiveInteger(window.prompt('표 열 수를 입력하세요.', '3'), 3);

  restoreSelection(editor, selection)
    .insertTable({
      cols: columns,
      rows,
      withHeaderRow: true,
    })
    .run();
}

// 수식 버튼은 등록된 수식 작성 모달을 우선 열고, 모달이 없으면 기본 입력창으로 대체한다.
function openMathBlockModal(editor, selection) {
  if (typeof editor.storage?.mathBlock?.openModal === 'function') {
    editor.storage.mathBlock.openModal({ selection, initialLatex: '' });
    return;
  }

  const latex = window.prompt('LaTeX 수식을 입력하세요.', '\\frac{a}{b} = c');

  if (latex === null || !latex.trim()) {
    return;
  }

  restoreSelection(editor, selection).insertMathBlock(latex.trim()).run();
}

// 구분 영역은 큰 덩어리 콘텐츠를 눈에 띄게 묶고 싶을 때 쓰는 블록이다.
function promptSectionBlock(editor, selection) {
  const sectionTitle = window.prompt('구분 영역 제목을 입력하세요.', '구분 영역');

  if (sectionTitle === null) {
    return;
  }

  const sectionBody = window.prompt('구분 영역 내용을 입력하세요.', '영역 내용을 입력하세요.');

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
  '토글 섹션': promptDetailsBlock,
  링크: promptLink,
  이미지: promptImage,
  파일: promptFileLink,
  표: promptTable,
  '수식(LaTeX)': openMathBlockModal,
  '구분 영역': promptSectionBlock,
};

export function executePromptToolbarAction(editor, itemLabel, selection) {
  // 매핑에 없는 버튼은 조용히 무시해서 미구현 버튼이 있어도 에디터가 깨지지 않게 둔다.
  PROMPT_TOOLBAR_ACTIONS[itemLabel]?.(editor, selection);
}

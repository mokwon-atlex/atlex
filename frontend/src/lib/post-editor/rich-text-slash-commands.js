import { executePromptToolbarAction, SIMPLE_TOOLBAR_ACTIONS } from '@/lib/post-editor/rich-text-toolbar';
import { getSelectionSnapshot } from '@/lib/post-editor/rich-text-utils';

/**
 * 본문에서 `/` 입력 시 사용할 수 있는 블록·서식 단축 명령어 목록이다.
 * 영문 명령어와 한글 별칭을 함께 지원한다.
 */
export const SLASH_COMMANDS = [
  {
    id: 'code-block',
    command: '/code',
    label: '코드 블록',
    description: '문법 강조가 적용된 코드 블록을 삽입합니다',
    aliases: ['code', 'codeblock', '코드', '코드블록', '소스'],
    toolbarAction: '코드 블록',
  },
  {
    id: 'heading-1',
    command: '/h1',
    label: '제목 1',
    description: '가장 큰 대제목으로 전환합니다',
    aliases: ['h1', 'heading1', '제목1', '헤더1', '대제목'],
    toolbarAction: '제목 1',
  },
  {
    id: 'heading-2',
    command: '/h2',
    label: '제목 2',
    description: '섹션을 나누는 중제목으로 전환합니다',
    aliases: ['h2', 'heading2', '제목2', '헤더2', '소제목'],
    toolbarAction: '제목 2',
  },
  {
    id: 'heading-3',
    command: '/h3',
    label: '제목 3',
    description: '세부 항목 소제목으로 전환합니다',
    aliases: ['h3', 'heading3', '제목3', '헤더3'],
    toolbarAction: '제목 3',
  },
  {
    id: 'quote',
    command: '/quote',
    label: '인용문',
    description: '강조하고 싶은 문장이나 인용구를 넣습니다',
    aliases: ['quote', 'blockquote', '인용', '인용문'],
    toolbarAction: '인용문',
  },
  {
    id: 'bullet-list',
    command: '/bullet',
    label: '글머리 목록',
    description: '점 기호로 항목을 나열합니다',
    aliases: ['bullet', 'list', 'ul', '목록', '리스트', '글머리'],
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'ordered-list',
    command: '/number',
    label: '번호 목록',
    description: '순서가 있는 번호 목록을 만듭니다',
    aliases: ['number', 'ordered', 'ol', '번호', '숫자목록'],
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'table',
    command: '/table',
    label: '표',
    description: '행과 열을 지정해 표를 삽입합니다',
    aliases: ['table', '표', '테이블'],
    toolbarAction: '표',
  },
  {
    id: 'math',
    command: '/math',
    label: '수식(LaTeX)',
    description: 'LaTeX 수식 블록을 삽입합니다',
    aliases: ['math', 'latex', 'formula', '수식', '공식'],
    toolbarAction: '수식(LaTeX)',
  },
  {
    id: 'toggle',
    command: '/toggle',
    label: '토글 섹션',
    description: '접고 펼칠 수 있는 토글 블록을 삽입합니다',
    aliases: ['toggle', 'details', '토글', '접기'],
    toolbarAction: '토글 섹션',
  },
  {
    id: 'divider',
    command: '/hr',
    label: '구분선',
    description: '문단을 나누는 가로 구분선을 넣습니다',
    aliases: ['hr', 'divider', 'line', '구분선', '가로선'],
    toolbarAction: '구분선',
  },
  {
    id: 'image',
    command: '/image',
    label: '이미지',
    description: '이미지 파일을 업로드해 본문에 넣습니다',
    aliases: ['image', 'img', 'photo', '이미지', '사진'],
    toolbarAction: '이미지',
  },
  {
    id: 'file',
    command: '/file',
    label: '파일',
    description: '첨부파일을 업로드해 다운로드 링크를 넣습니다',
    aliases: ['file', 'attachment', '파일', '첨부'],
    toolbarAction: '파일',
  },
  {
    id: 'link',
    command: '/link',
    label: '링크',
    description: '외부 URL 링크를 삽입합니다',
    aliases: ['link', 'url', '링크'],
    toolbarAction: '링크',
  },
  {
    id: 'post-link',
    command: '/post',
    label: '내 글 링크',
    description: '내 블로그의 다른 게시글을 검색해 연결합니다',
    aliases: ['post', 'internal', '내글', '내글링크', '게시글'],
    toolbarAction: '내 글 링크',
  },
  {
    id: 'lead',
    command: '/lead',
    label: '리드 문단',
    description: '도입부를 강조하는 리드 문단으로 전환합니다',
    aliases: ['lead', '리드', '리드문단', '도입'],
    toolbarAction: '리드 문단',
  },
  {
    id: 'caption',
    command: '/caption',
    label: '캡션',
    description: '이미지나 설명용 작은 캡션 문단으로 전환합니다',
    aliases: ['caption', '캡션', '설명'],
    toolbarAction: '캡션',
  },
];

/** 툴바 버튼 툴팁에 함께 표시할 슬래시 단축어 매핑이다. */
export const TOOLBAR_SLASH_HINT_MAP = Object.fromEntries(
  SLASH_COMMANDS.filter((item) => item.toolbarAction).map((item) => [item.toolbarAction, item.command]),
);

/**
 * 입력한 검색어에 맞는 슬래시 커맨드를 필터링하고 접두사 일치 항목을 우선 정렬한다.
 *
 * @param {string} query `/` 뒤에 입력한 검색어
 * @returns {typeof SLASH_COMMANDS} 일치하는 명령어 목록
 */
export function filterSlashCommands(query = '') {
  const normalized = String(query ?? '')
    .trim()
    .toLowerCase()
    .replace(/^\/+/, '');

  if (!normalized) {
    return SLASH_COMMANDS;
  }

  return SLASH_COMMANDS.map((item) => {
    const commandKey = item.command.slice(1).toLowerCase();
    const label = item.label.toLowerCase();
    const description = item.description.toLowerCase();
    const aliases = item.aliases.map((alias) => alias.toLowerCase());

    let rank = Number.POSITIVE_INFINITY;

    if (commandKey === normalized || aliases.includes(normalized)) {
      rank = 0;
    } else if (commandKey.startsWith(normalized) || aliases.some((alias) => alias.startsWith(normalized))) {
      rank = 1;
    } else if (label.startsWith(normalized)) {
      rank = 2;
    } else if (
      commandKey.includes(normalized) ||
      aliases.some((alias) => alias.includes(normalized)) ||
      label.includes(normalized) ||
      description.includes(normalized)
    ) {
      rank = 3;
    }

    return { item, rank };
  })
    .filter(({ rank }) => Number.isFinite(rank))
    .sort((left, right) => left.rank - right.rank)
    .map(({ item }) => item);
}

/**
 * 선택된 슬래시 커맨드를 실행한다.
 * 본문에 남아 있는 `/검색어` 텍스트를 먼저 제거한 뒤 해당 블록·서식 명령을 호출한다.
 *
 * @param {import('@tiptap/react').Editor} editor TipTap 에디터 인스턴스
 * @param {(typeof SLASH_COMMANDS)[number]} commandItem 실행할 명령어 항목
 * @param {{ from: number, to: number } | null} [range] 삭제할 `/검색어` 범위
 * @returns {boolean} 실행 성공 여부
 */
export function executeSlashCommand(editor, commandItem, range = null) {
  if (!editor || !commandItem) {
    return false;
  }

  if (range) {
    editor.chain().focus().deleteRange(range).run();
  }

  if (typeof commandItem.run === 'function') {
    commandItem.run(editor);
    return true;
  }

  if (commandItem.toolbarAction) {
    const simpleAction = SIMPLE_TOOLBAR_ACTIONS[commandItem.toolbarAction];

    if (simpleAction) {
      simpleAction(editor);
      return true;
    }

    const selection = getSelectionSnapshot(editor);

    executePromptToolbarAction(editor, commandItem.toolbarAction, selection);
    return true;
  }

  return false;
}

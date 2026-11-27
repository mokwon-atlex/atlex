'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor } from '@tiptap/react';
import { editorExtensions } from '@/lib/post-editor/rich-text-extensions';
import {
  executePromptToolbarAction,
  getItemActiveState,
  SIMPLE_TOOLBAR_ACTIONS,
  uploadAndInsertAttachment,
  uploadAndInsertImage,
} from '@/lib/post-editor/rich-text-toolbar';
import {
  createInitialContent,
  getSelectionSnapshot,
  normalizeUrl,
  restoreSelection,
} from '@/lib/post-editor/rich-text-utils';

// 이 훅은 "에디터 생성", "본문 상태 동기화", "툴바 버튼 연결" 세 가지를 한곳에 모은다.
// 화면 컴포넌트는 복잡한 TipTap API 대신 이 훅이 돌려주는 값과 함수만 사용하면 된다.
// 이 훅은 세 가지 역할만 담당한다.
// 1. TipTap 에디터 생성
// 2. 본문 텍스트와 비어 있는 상태 동기화
// 3. 사이드바 버튼이 누르는 편집 명령 연결

export default function usePostEditorRichText({ initialContent = '' } = {}) {
  const [bodyText, setBodyText] = useState(initialContent);
  const [bodyImages, setBodyImages] = useState([]);
  const [isEditorEmpty, setIsEditorEmpty] = useState(!initialContent.trim());
  // 본문 글자 수가 그대로여도 서식/undo 가능 여부는 바뀔 수 있어서
  // 에디터 트랜잭션마다 한 번 더 렌더링해 패널 버튼 상태를 최신으로 맞춘다.
  const [, setToolbarStateTick] = useState(0);
  const [mathModalState, setMathModalState] = useState({
    isOpen: false,
    initialLatex: '',
    selection: null,
    editPos: null,
  });
  const [linkModalState, setLinkModalState] = useState({
    isOpen: false,
    initialUrl: '',
    initialText: '',
    hasSelection: false,
    isActiveLink: false,
    selection: null,
  });
  const [tableModalState, setTableModalState] = useState({
    isOpen: false,
    isTableActive: false,
    selection: null,
  });
  const editorRef = useRef(null);

  // 태그 추출과 글자 수 표시는 HTML이 아니라 사용자가 보는 순수 텍스트 기준으로 맞춘다.
  function syncEditorState(nextEditor) {
    setBodyText(nextEditor.getText());
    setIsEditorEmpty(nextEditor.isEmpty);

    const nextImages = [];
    const seen = new Set();
    nextEditor.state.doc.descendants((node) => {
      if (node.type.name === 'image') {
        const src = typeof node.attrs?.src === 'string' ? node.attrs.src.trim() : '';
        if (src && !seen.has(src)) {
          seen.add(src);
          nextImages.push(src);
        }
      }
    });
    setBodyImages((prev) =>
      prev.length === nextImages.length && prev.every((item, idx) => item === nextImages[idx]) ? prev : nextImages,
    );
  }

  const editor = useEditor({
    // Next.js 환경에서 에디터가 너무 일찍 그려지면 초기 마크업이 흔들릴 수 있어 렌더 시점을 늦춘다.
    immediatelyRender: false,
    // 서버에서 받은 초깃값을 TipTap 이 이해하는 문서 구조로 바꿔 넣는다.
    content: createInitialContent(initialContent),
    editorProps: {
      attributes: {
        class: 'post-editor-prose__surface',
      },
      handleDrop(_view, event, _slice, moved) {
        if (moved || !event.dataTransfer?.files?.length) {
          return false;
        }
        const files = Array.from(event.dataTransfer.files);
        if (files.length === 0) {
          return false;
        }
        event.preventDefault();
        files.forEach((file) => {
          if (file.type.startsWith('image/')) {
            uploadAndInsertImage(editorRef.current, file);
          } else {
            uploadAndInsertAttachment(editorRef.current, file);
          }
        });
        return true;
      },
      handlePaste(_view, event) {
        const files = Array.from(event.clipboardData?.files ?? []);
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));
        if (imageFiles.length === 0) {
          return false;
        }
        event.preventDefault();
        imageFiles.forEach((file) => {
          uploadAndInsertImage(editorRef.current, file);
        });
        return true;
      },
    },
    extensions: editorExtensions,
    onCreate({ editor: nextEditor }) {
      editorRef.current = nextEditor;
      // 첫 렌더 직후에도 본문 텍스트와 empty 상태를 맞춰 둔다.
      syncEditorState(nextEditor);
      setToolbarStateTick((currentValue) => currentValue + 1);
    },
    onTransaction() {
      // storedMarks 변경(빈 줄에서 볼드·취소선 토글 등)과 커서 이동에도 툴바 활성 상태를 즉시 반영한다.
      setToolbarStateTick((currentValue) => currentValue + 1);
    },
    onUpdate({ editor: nextEditor }) {
      // 사용자가 입력할 때마다 화면에서 보여 주는 본문 상태도 같이 갱신한다.
      syncEditorState(nextEditor);
    },
  });

  useEffect(() => {
    if (!editor?.storage) {
      return;
    }

    if (editor.storage.mathBlock) {
      editor.storage.mathBlock.openModal = ({ selection = null, initialLatex = '', editPos = null } = {}) => {
        setMathModalState({
          isOpen: true,
          initialLatex,
          selection: selection ?? getSelectionSnapshot(editor),
          editPos,
        });
      };
    }

    editor.storage.linkModal = {
      openModal: ({
        selection = null,
        initialUrl = '',
        initialText = '',
        hasSelection = false,
        isActiveLink = false,
      } = {}) => {
        setLinkModalState({
          isOpen: true,
          initialUrl,
          initialText,
          hasSelection,
          isActiveLink,
          selection: selection ?? getSelectionSnapshot(editor),
        });
      },
    };

    editor.storage.tableModal = {
      openModal: ({ selection = null, isTableActive = false } = {}) => {
        setTableModalState({
          isOpen: true,
          isTableActive,
          selection: selection ?? getSelectionSnapshot(editor),
        });
      },
    };

    return () => {
      if (editor?.storage?.mathBlock) {
        editor.storage.mathBlock.openModal = null;
      }
      if (editor?.storage) {
        editor.storage.linkModal = null;
        editor.storage.tableModal = null;
      }
    };
  }, [editor]);

  function closeMathModal() {
    setMathModalState((prev) => ({ ...prev, isOpen: false }));
  }

  function submitMathModal(latex) {
    if (!editor || !latex?.trim()) {
      return;
    }

    const trimmed = latex.trim();

    if (typeof mathModalState.editPos === 'number') {
      editor.chain().focus().updateMathBlockAt(mathModalState.editPos, trimmed).run();
    } else if (mathModalState.selection) {
      restoreSelection(editor, mathModalState.selection).insertMathBlock(trimmed).run();
    } else {
      editor.chain().focus().insertMathBlock(trimmed).run();
    }

    closeMathModal();
  }

  function closeLinkModal() {
    setLinkModalState((prev) => ({ ...prev, isOpen: false }));
  }

  function submitLinkModal({ url, text }) {
    if (!editor) {
      return;
    }

    const nextHref = normalizeUrl(url ?? '');
    const chain = linkModalState.selection
      ? restoreSelection(editor, linkModalState.selection)
      : editor.chain().focus();

    if (!nextHref) {
      chain.extendMarkRange('link').unsetLink().run();
      closeLinkModal();
      return;
    }

    if (linkModalState.hasSelection || linkModalState.isActiveLink) {
      chain.extendMarkRange('link').setLink({ href: nextHref }).run();
      closeLinkModal();
      return;
    }

    chain
      .insertContent({
        type: 'text',
        text: text?.trim() || nextHref,
        marks: [{ type: 'link', attrs: { href: nextHref } }],
      })
      .run();
    closeLinkModal();
  }

  function removeLinkModal() {
    if (!editor) {
      return;
    }

    const chain = linkModalState.selection
      ? restoreSelection(editor, linkModalState.selection)
      : editor.chain().focus();
    chain.extendMarkRange('link').unsetLink().run();
    closeLinkModal();
  }

  function closeTableModal() {
    setTableModalState((prev) => ({ ...prev, isOpen: false }));
  }

  function submitTableModal({ rows, cols }) {
    if (!editor || editor.isActive('table')) {
      closeTableModal();
      return;
    }

    const chain = tableModalState.selection
      ? restoreSelection(editor, tableModalState.selection)
      : editor.chain().focus();

    chain
      .insertTable({
        cols,
        rows,
        withHeaderRow: true,
      })
      .run();
    closeTableModal();
  }

  function deleteCurrentTable() {
    if (!editor) {
      return;
    }
    editor.chain().focus().deleteTable().run();
  }

  function executeToolbarItem(groupId, itemLabel) {
    if (!editor || groupId === 'font-color') {
      // 색상 그룹은 아직 실제 기능과 연결하지 않았으므로 여기서 막아 둔다.
      return;
    }

    // 먼저 즉시 실행 가능한 명령인지 확인한다.
    const simpleAction = SIMPLE_TOOLBAR_ACTIONS[itemLabel];

    if (simpleAction) {
      simpleAction(editor);
      return;
    }

    // prompt를 띄우면 포커스가 잠깐 빠지므로, 삽입형 기능은 현재 선택 범위를 먼저 저장해 둔다.
    const selection = getSelectionSnapshot(editor);

    executePromptToolbarAction(editor, itemLabel, selection);
  }

  function getToolbarItemState(groupId, itemLabel) {
    if (!editor) {
      return {
        isActive: false,
        isDisabled: true,
      };
    }

    if (groupId === 'font-color') {
      return {
        isActive: false,
        isDisabled: true,
      };
    }

    // 실행 취소 / 다시 실행은 히스토리가 비어 있어도 항상 눌릴 수 있게 열어 둔다.
    // 실제로 되돌릴 내용이 없으면 TipTap 명령이 조용히 no-op 으로 끝난다.
    if (itemLabel === '실행 취소') {
      return {
        isActive: false,
        isDisabled: false,
      };
    }

    if (itemLabel === '다시 실행') {
      return {
        isActive: false,
        isDisabled: false,
      };
    }

    // 나머지 버튼은 현재 선택 범위에 해당 서식이 적용돼 있는지만 보면 된다.
    return {
      isActive: getItemActiveState(editor, itemLabel),
      isDisabled: false,
    };
  }

  // 본문을 HTML 문자열로 추출한다(서식 보존). 저장 시 백엔드 content 로 보낸다.
  function getHTML() {
    return editor?.getHTML() ?? '';
  }

  return {
    bodyImages,
    bodyText,
    closeLinkModal,
    closeMathModal,
    closeTableModal,
    deleteCurrentTable,
    editor,
    executeToolbarItem,
    getHTML,
    getToolbarItemState,
    isEditorEmpty,
    linkModalState,
    mathModalState,
    removeLinkModal,
    submitLinkModal,
    submitMathModal,
    submitTableModal,
    tableModalState,
  };
}

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const formatResetPluginKey = new PluginKey('formatResetPlugin');

/**
 * 두 마크 배열이 동일한 마크 집합을 가지는지 비교한다.
 *
 * @param {readonly import('@tiptap/pm/model').Mark[]} [left] 비교 대상 1
 * @param {readonly import('@tiptap/pm/model').Mark[]} [right] 비교 대상 2
 * @returns {boolean} 동일 여부
 */
export function hasSameMarks(left = [], right = []) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((mark, index) => mark.eq(right[index]));
}

/**
 * 텍스트 삭제·줄바꿈 후 비어 있는 문단에 인라인 서식(취소선·볼드·이탤릭·밑줄 등)이
 * 남거나 다음 줄로 이어지는 문제를 방지하고, 빈 블록 서식을 기본 문단으로 해제하는 확장이다.
 */
export const FormatResetExtension = Extension.create({
  name: 'formatReset',
  priority: 150,

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (editor.storage?.slashCommand?.isOpen || editor.storage?.postLink?.isOpen) {
          return false;
        }

        const { selection } = editor.state;
        if (!selection.empty) {
          return false;
        }

        const { $from } = selection;
        const parentName = $from.parent.type.name;

        // 비어 있는 제목·리드 문단·캡션에서 Enter를 누르면 빈 서식 블록을 남기지 않고 기본 문단으로 되돌린다.
        if (
          (parentName === 'heading' || parentName === 'leadParagraph' || parentName === 'captionParagraph') &&
          $from.parent.content.size === 0
        ) {
          return editor.chain().setParagraph().unsetAllMarks().run();
        }

        // 리드 문단·캡션 끝에서 Enter를 누르면 다음 줄은 일반 본문 문단으로 이어진다.
        if (
          (parentName === 'leadParagraph' || parentName === 'captionParagraph') &&
          $from.parentOffset === $from.parent.content.size
        ) {
          return editor.chain().splitBlock().setParagraph().unsetAllMarks().run();
        }

        // 인용문 안의 빈 문단에서 Enter를 누르면 인용문에서 빠져나와 일반 본문으로 돌아간다.
        if (
          parentName === 'paragraph' &&
          $from.parent.content.size === 0 &&
          editor.isActive('blockquote') &&
          !editor.isActive('bulletList') &&
          !editor.isActive('orderedList') &&
          !editor.isActive('table')
        ) {
          return editor.chain().lift('blockquote').unsetAllMarks().run();
        }

        return false;
      },

      Backspace: ({ editor }) => {
        if (editor.storage?.slashCommand?.isOpen || editor.storage?.postLink?.isOpen) {
          return false;
        }

        const { selection } = editor.state;
        if (!selection.empty) {
          return false;
        }

        const { $from } = selection;
        if ($from.parentOffset !== 0) {
          return false;
        }

        const parentName = $from.parent.type.name;

        // 비어 있는 인용문 줄 맨 앞에서 Backspace를 누르면 인용문을 해제한다.
        if (
          parentName === 'paragraph' &&
          $from.parent.content.size === 0 &&
          editor.isActive('blockquote') &&
          !editor.isActive('bulletList') &&
          !editor.isActive('orderedList') &&
          !editor.isActive('table')
        ) {
          return editor.chain().lift('blockquote').unsetAllMarks().run();
        }

        // 비어 있는 제목·리드 문단·캡션·코드 블록 맨 앞에서 Backspace를 누르면 기본 문단으로 되돌린다.
        if (
          (parentName === 'heading' ||
            parentName === 'leadParagraph' ||
            parentName === 'captionParagraph' ||
            parentName === 'codeBlock') &&
          $from.parent.content.size === 0
        ) {
          return editor.chain().setParagraph().unsetAllMarks().run();
        }

        return false;
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: formatResetPluginKey,
        appendTransaction(transactions, oldState, newState) {
          const hasDocChange = transactions.some((tr) => tr.docChanged);
          if (!hasDocChange) {
            return null;
          }

          // 실행 취소/다시 실행(history)은 원래 상태를 그대로 복원하도록 건드리지 않는다.
          const isHistoryChange = transactions.some((tr) => tr.getMeta('history$'));
          if (isHistoryChange) {
            return null;
          }

          const { selection } = newState;
          if (!selection.empty) {
            return null;
          }

          const { $from } = selection;
          if (!$from.parent.isTextblock || $from.parent.type.spec.code) {
            return null;
          }

          // 1) 삭제나 Enter 줄바꿈 직후 커서가 비어 있는 텍스트 블록에 놓이면 잔여 인라인 마크를 비운다.
          if ($from.parent.content.size === 0) {
            const activeMarks = newState.storedMarks ?? $from.marks();
            if (activeMarks.length > 0) {
              return newState.tr.setStoredMarks([]);
            }
            return null;
          }

          // 2) 삭제 직후 커서 앞 텍스트에 없는 잔여 storedMarks가 남아 있으면 앞 텍스트 기준으로 맞춘다.
          if (newState.doc.content.size < oldState.doc.content.size && newState.storedMarks) {
            const expectedMarks = $from.nodeBefore?.marks ?? [];
            if (!hasSameMarks(newState.storedMarks, expectedMarks)) {
              return newState.tr.setStoredMarks(expectedMarks);
            }
          }

          return null;
        },
      }),
    ];
  },
});

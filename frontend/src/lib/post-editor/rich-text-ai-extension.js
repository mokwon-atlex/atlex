import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const aiSuggestionPluginKey = new PluginKey('aiSuggestionPlugin');

/**
 * Tiptap 에디터 내에서 커서 뒤에 반투명 회색 텍스트(Ghost Text)를 표시하고
 * Tab 키를 눌렀을 때 실제 본문으로 삽입하는 커스텀 확장입니다.
 */
export const AiSuggestionExtension = Extension.create({
  name: 'aiSuggestion',

  addOptions() {
    return {
      onAccept: null,
      onDismiss: null,
    };
  },

  addStorage() {
    return {
      suggestion: '',
    };
  },

  addCommands() {
    return {
      setAiSuggestion:
        (suggestion) =>
        ({ editor, tr, dispatch }) => {
          editor.storage.aiSuggestion.suggestion = suggestion;
          if (dispatch) tr.setMeta(aiSuggestionPluginKey, { suggestion });
          return true;
        },
      clearAiSuggestion:
        () =>
        ({ editor, tr, dispatch }) => {
          editor.storage.aiSuggestion.suggestion = '';
          if (dispatch) tr.setMeta(aiSuggestionPluginKey, { suggestion: '' });
          return true;
        },
      acceptAiSuggestion:
        () =>
        ({ editor, commands }) => {
          const suggestion = editor.storage.aiSuggestion.suggestion;
          if (!suggestion) return false;

          commands.insertContent(suggestion);
          commands.clearAiSuggestion();
          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        const suggestion = editor.storage.aiSuggestion.suggestion;
        if (!suggestion) {
          return false; // 추천이 없으면 기본 브라우저/에디터 Tab 동작 유지
        }
        return editor.commands.acceptAiSuggestion();
      },
      Escape: ({ editor }) => {
        const suggestion = editor.storage.aiSuggestion.suggestion;
        if (!suggestion) {
          return false;
        }
        return editor.commands.clearAiSuggestion();
      },
    };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: aiSuggestionPluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldSet) {
            const meta = tr.getMeta(aiSuggestionPluginKey);
            if (meta) {
              const text = meta.suggestion;
              if (!text) return DecorationSet.empty;

              const pos = tr.selection.from;
              const widget = Decoration.widget(pos, () => {
                const span = document.createElement('span');
                span.className = 'text-muted-foreground/50 select-none pointer-events-none opacity-50';
                span.textContent = text;
                return span;
              });
              return DecorationSet.create(tr.doc, [widget]);
            }
            if (tr.docChanged || tr.selectionSet) {
              // 본문이 바뀌거나 커서가 이동하면 추천 자동 제거
              editor.storage.aiSuggestion.suggestion = '';
              return DecorationSet.empty;
            }
            return oldSet.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

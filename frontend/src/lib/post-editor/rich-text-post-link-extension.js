import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const postLinkPluginKey = new PluginKey('postLinkPlugin');

/**
 * Tiptap 에디터 내에서 [[ 입력 시 게시글 링크 검색 팝업을 트리거하고,
 * 게시글을 선택했을 때 본문에 내부 링크 형식으로 삽입하는 확장입니다.
 */
export const PostLinkExtension = Extension.create({
  name: 'postLink',

  addStorage() {
    return {
      isOpen: false,
      isModalOpen: false,
      query: '',
      range: null,
      coords: null,
    };
  },

  addCommands() {
    return {
      openPostLinkSearch:
        () =>
        ({ editor }) => {
          editor.storage.postLink.isOpen = true;
          editor.storage.postLink.isModalOpen = true;
          editor.storage.postLink.query = '';
          editor.storage.postLink.range = null;
          editor.storage.postLink.coords = null;

          editor.emit('postLinkTrigger', {
            isOpen: true,
            isModal: true,
            query: '',
            range: null,
            coords: null,
          });
          return true;
        },

      closePostLinkSearch:
        () =>
        ({ editor }) => {
          editor.storage.postLink.isOpen = false;
          editor.storage.postLink.isModalOpen = false;
          editor.storage.postLink.query = '';
          editor.storage.postLink.range = null;
          editor.storage.postLink.coords = null;

          editor.emit('postLinkClose');
          return true;
        },

      insertPostLink:
        ({ title, href, range }) =>
        ({ chain, commands, state }) => {
          const cleanTitle = (title || '').trim();
          const cleanHref = (href || '').trim();
          if (!cleanHref) return false;

          const displayTitle = cleanTitle || cleanHref;
          let step = chain().focus();

          if (range) {
            step = step.deleteRange(range);
          } else if (state.selection && !state.selection.empty) {
            const success = step.extendMarkRange('link').setLink({ href: cleanHref }).run();
            commands.closePostLinkSearch();
            return success;
          }

          const success = step
            .insertContent([
              {
                type: 'text',
                text: displayTitle,
                marks: [{ type: 'link', attrs: { href: cleanHref } }],
              },
              {
                type: 'text',
                text: ' ',
              },
            ])
            .run();

          commands.closePostLinkSearch();
          return success;
        },
    };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: postLinkPluginKey,
        props: {
          handleKeyDown(view, event) {
            const storage = editor.storage?.postLink;
            if (storage?.isOpen && !storage?.isModalOpen) {
              if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(event.key)) {
                let isHandled = false;
                editor.emit('postLinkKeyDown', {
                  key: event.key,
                  preventDefault: () => {
                    isHandled = true;
                    event.preventDefault();
                  },
                });
                return isHandled;
              }
            }
            return false;
          },
        },
        view() {
          return {
            update(view) {
              const storage = editor.storage?.postLink;
              if (storage?.isModalOpen) {
                return;
              }

              const { state } = view;
              const { selection } = state;

              if (!selection.empty) {
                if (storage?.isOpen) {
                  editor.commands.closePostLinkSearch();
                }
                return;
              }

              const $from = selection.$from;
              // 코드 블록 또는 인라인 코드 내부에서는 [[ 링크 트리거 비활성화
              if ($from.parent.type.name === 'codeBlock' || editor.isActive('code')) {
                if (storage?.isOpen && !storage?.isModalOpen) {
                  editor.commands.closePostLinkSearch();
                }
                return;
              }

              // 현재 블록 내 커서 앞쪽 텍스트 검사
              const textBefore = $from.parent.textBetween(0, $from.parentOffset, null, '\ufffc');
              const match = /\[\[([^\]\n]*)$/.exec(textBefore);

              if (match) {
                const query = match[1];
                const from = $from.pos - match[0].length;
                const to = $from.pos;

                let coords = null;
                try {
                  coords = view.coordsAtPos($from.pos);
                } catch {
                  // ignore
                }

                storage.isOpen = true;
                storage.isModalOpen = false;
                storage.query = query;
                storage.range = { from, to };
                storage.coords = coords;

                editor.emit('postLinkTrigger', {
                  isOpen: true,
                  isModal: false,
                  query,
                  range: { from, to },
                  coords,
                });
              } else if (storage?.isOpen && !storage?.isModalOpen) {
                editor.commands.closePostLinkSearch();
              }
            },
          };
        },
      }),
    ];
  },
});

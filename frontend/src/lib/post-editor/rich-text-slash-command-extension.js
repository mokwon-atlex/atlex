import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const slashCommandPluginKey = new PluginKey('slashCommandPlugin');

const SLASH_TRIGGER_PATTERN = /(?:^|\s)(\/([^\s/]*))$/;

/**
 * 커서 앞쪽 텍스트에서 슬래시 커맨드 트리거(`/검색어`)를 감지한다.
 * URL(`https://...`)이나 단어 중간의 슬래시(`a/b`)는 오동작하지 않도록 줄 시작 또는 공백 뒤 `/`만 허용한다.
 *
 * @param {string} textBefore 현재 블록 내 커서 앞쪽 문자열
 * @returns {{ matchLength: number, query: string } | null} 감지된 트리거 정보
 */
export function matchSlashCommandTrigger(textBefore) {
  const match = SLASH_TRIGGER_PATTERN.exec(String(textBefore ?? ''));

  if (!match) {
    return null;
  }

  return {
    matchLength: match[1].length,
    query: match[2],
  };
}

/**
 * Tiptap 에디터 본문에서 `/` 입력 시 슬래시 커맨드 팝오버를 트리거하고
 * 방향키·Enter·Tab·Escape 입력을 팝오버로 위임하는 확장이다.
 */
export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addStorage() {
    return {
      isOpen: false,
      query: '',
      range: null,
      coords: null,
    };
  },

  addCommands() {
    return {
      closeSlashCommand:
        () =>
        ({ editor }) => {
          editor.storage.slashCommand.isOpen = false;
          editor.storage.slashCommand.query = '';
          editor.storage.slashCommand.range = null;
          editor.storage.slashCommand.coords = null;

          editor.emit('slashCommandClose');
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: slashCommandPluginKey,
        props: {
          handleKeyDown(_view, event) {
            const storage = editor.storage?.slashCommand;

            if (storage?.isOpen && ['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape'].includes(event.key)) {
              let isHandled = false;

              editor.emit('slashCommandKeyDown', {
                key: event.key,
                preventDefault: () => {
                  isHandled = true;
                  event.preventDefault();
                },
              });
              return isHandled;
            }

            return false;
          },
        },
        view() {
          return {
            update(view) {
              const storage = editor.storage?.slashCommand;
              const { state } = view;
              const { selection } = state;

              // 범위 선택 중이거나 내 글 링크([[) 팝업이 열려 있으면 슬래시 메뉴를 닫는다.
              if (!selection.empty || editor.storage?.postLink?.isOpen) {
                if (storage?.isOpen) {
                  editor.commands.closeSlashCommand();
                }
                return;
              }

              const $from = selection.$from;

              // 코드 블록·수식 블록·인라인 코드 안에서는 슬래시 커맨드를 비활성화한다.
              if (
                $from.parent.type.name === 'codeBlock' ||
                $from.parent.type.name === 'mathBlock' ||
                editor.isActive('code')
              ) {
                if (storage?.isOpen) {
                  editor.commands.closeSlashCommand();
                }
                return;
              }

              const textBefore = $from.parent.textBetween(0, $from.parentOffset, null, '\ufffc');
              const matched = matchSlashCommandTrigger(textBefore);

              if (matched) {
                const from = $from.pos - matched.matchLength;
                const to = $from.pos;
                let coords = null;

                try {
                  coords = view.coordsAtPos($from.pos);
                } catch {
                  // 가상 DOM 테스트 환경 등 좌표 계산이 불가능한 경우 기본 위치를 사용한다.
                }

                storage.isOpen = true;
                storage.query = matched.query;
                storage.range = { from, to };
                storage.coords = coords;

                editor.emit('slashCommandTrigger', {
                  isOpen: true,
                  query: matched.query,
                  range: { from, to },
                  coords,
                });
              } else if (storage?.isOpen) {
                editor.commands.closeSlashCommand();
              }
            },
          };
        },
      }),
    ];
  },
});

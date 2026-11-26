'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { List, ListOrdered, Terminal } from 'lucide-react';

import { executeSlashCommand, filterSlashCommands } from '@/lib/post-editor/rich-text-slash-commands';
import { TOOLBAR_ITEM_ICON_MAP } from '@/lib/post-editor/rich-text-toolbar-icons';
import { cn } from '@/lib/utils';

const POPOVER_WIDTH = 312;
const POPOVER_ESTIMATED_HEIGHT = 310;

const EXTRA_COMMAND_ICONS = {
  'bullet-list': List,
  'ordered-list': ListOrdered,
};

/** 명령어 항목에 맞는 아이콘 컴포넌트를 반환한다. */
function resolveCommandIcon(item) {
  return EXTRA_COMMAND_ICONS[item.id] ?? TOOLBAR_ITEM_ICON_MAP[item.toolbarAction] ?? Terminal;
}

/**
 * 에디터 본문에서 `/` 입력 시 커서 근처에 뜨는 블록·서식 단축 명령어 팝오버다.
 *
 * @param {object} props
 * @param {import('@tiptap/react').Editor} props.editor TipTap 에디터 인스턴스
 */
export default function SlashCommandPopover({ editor }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [range, setRange] = useState(null);
  const [coords, setCoords] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const popoverRef = useRef(null);
  const listContainerRef = useRef(null);

  const filteredCommands = useMemo(() => filterSlashCommands(query), [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, filteredCommands.length]);

  useEffect(() => {
    if (!listContainerRef.current) {
      return;
    }

    const activeElement = listContainerRef.current.querySelector(`[data-command-index="${selectedIndex}"]`);

    if (activeElement) {
      activeElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setRange(null);
    setCoords(null);
    editor?.commands.closeSlashCommand?.();
  };

  const handleSelectCommand = (commandItem) => {
    if (!editor || !commandItem) {
      return;
    }

    const activeRange = range;

    handleClose();
    executeSlashCommand(editor, commandItem, activeRange);
  };

  useEffect(() => {
    if (!editor) {
      return undefined;
    }

    const onTrigger = (payload) => {
      setIsOpen(true);
      setQuery(payload.query || '');
      setRange(payload.range || null);
      setCoords(payload.coords || null);
    };

    const onClose = () => {
      setIsOpen(false);
      setQuery('');
      setRange(null);
      setCoords(null);
    };

    const onKeyDown = ({ key, preventDefault }) => {
      if (!isOpen) {
        return;
      }

      if (key === 'ArrowDown') {
        preventDefault();
        setSelectedIndex((prev) => (filteredCommands.length ? (prev + 1) % filteredCommands.length : 0));
      } else if (key === 'ArrowUp') {
        preventDefault();
        setSelectedIndex((prev) =>
          filteredCommands.length ? (prev - 1 + filteredCommands.length) % filteredCommands.length : 0,
        );
      } else if (key === 'Enter' || key === 'Tab') {
        if (filteredCommands[selectedIndex]) {
          preventDefault();
          handleSelectCommand(filteredCommands[selectedIndex]);
        }
      } else if (key === 'Escape') {
        preventDefault();
        handleClose();
      }
    };

    editor.on('slashCommandTrigger', onTrigger);
    editor.on('slashCommandClose', onClose);
    editor.on('slashCommandKeyDown', onKeyDown);

    return () => {
      editor.off('slashCommandTrigger', onTrigger);
      editor.off('slashCommandClose', onClose);
      editor.off('slashCommandKeyDown', onKeyDown);
    };
  }, [editor, filteredCommands, isOpen, range, selectedIndex]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const shouldFlipUp = coords && coords.bottom + POPOVER_ESTIMATED_HEIGHT > viewportHeight && coords.top > 240;
  const topPos = coords
    ? shouldFlipUp
      ? Math.max(12, coords.top - POPOVER_ESTIMATED_HEIGHT)
      : Math.min(viewportHeight - POPOVER_ESTIMATED_HEIGHT, coords.bottom + 8)
    : 100;
  const leftPos = coords ? Math.max(12, Math.min(viewportWidth - POPOVER_WIDTH - 16, coords.left)) : 100;

  return (
    <div
      ref={popoverRef}
      role="listbox"
      aria-label="블록 및 서식 단축 명령어"
      data-slash-command-popover
      className="fixed z-50 w-[312px] max-w-[calc(100vw-1.5rem)] space-y-1.5 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-xl"
      style={{
        left: `${leftPos}px`,
        top: `${topPos}px`,
      }}
    >
      <div className="flex items-center justify-between border-b border-border/40 px-2 py-1 text-[11px] font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Terminal className="size-3 text-primary" />
          블록 · 서식 명령어
        </span>
        <span className="max-w-[120px] truncate font-mono text-[10px] font-normal">/{query}</span>
      </div>

      {filteredCommands.length === 0 ? (
        <div className="py-5 text-center text-xs text-muted-foreground">
          &apos;/{query}&apos;에 일치하는 명령어가 없습니다.
        </div>
      ) : (
        <div ref={listContainerRef} className="max-h-60 space-y-0.5 overflow-y-auto p-0.5">
          {filteredCommands.map((item, index) => {
            const Icon = resolveCommandIcon(item);
            const isSelected = index === selectedIndex;

            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                data-command-index={index}
                data-slash-command-id={item.id}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => handleSelectCommand(item)}
                className={cn(
                  'flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                  isSelected ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-muted/60',
                )}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground">
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold leading-tight">{item.label}</p>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <kbd className="shrink-0 rounded border border-border/60 bg-muted/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {item.command}
                </kbd>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-between border-t border-border/40 px-2 pt-1 text-[10px] text-muted-foreground">
        <span>↑↓ 이동 · Enter / Tab 삽입</span>
        <span>Esc 닫기</span>
      </div>
    </div>
  );
}

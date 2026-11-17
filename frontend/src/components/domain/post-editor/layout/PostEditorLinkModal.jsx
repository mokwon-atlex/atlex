'use client';

// [Section] 외부 링크 입력 모달 — window.prompt 대신 URL과 표시 텍스트를 입력받는다.
import { useEffect, useRef, useState } from 'react';
import { Link2, Trash2 } from 'lucide-react';

import { Button } from '@/components/common/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog';
import { Field, FieldLabel } from '@/components/common/ui/field';
import { Input } from '@/components/common/ui/input';

/**
 * 외부 링크 삽입 및 수정을 위한 모달.
 *
 * @param {object} props
 * @param {boolean} props.isOpen 모달 열림 여부
 * @param {string} [props.initialUrl] 기존 링크 URL
 * @param {string} [props.initialText] 선택된 텍스트
 * @param {boolean} [props.hasSelection] 텍스트 선택 또는 기존 링크 여부
 * @param {boolean} [props.isActiveLink] 기존 링크 위에서 열렸는지 여부
 * @param {() => void} props.onClose 닫기 핸들러
 * @param {(payload: { url: string, text: string }) => void} props.onSubmit 적용 핸들러
 * @param {() => void} [props.onRemove] 링크 제거 핸들러
 */
export default function PostEditorLinkModal({
  isOpen,
  initialUrl = '',
  initialText = '',
  hasSelection = false,
  isActiveLink = false,
  onClose,
  onSubmit,
  onRemove,
}) {
  const [url, setUrl] = useState(initialUrl);
  const [label, setLabel] = useState(initialText);
  const urlInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl ?? '');
      setLabel(initialText ?? '');
      const timerId = window.setTimeout(() => {
        urlInputRef.current?.focus();
      }, 40);
      return () => window.clearTimeout(timerId);
    }
  }, [isOpen, initialUrl, initialText]);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit?.({ url: url.trim(), text: label.trim() });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && onClose?.()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Link2 className="size-4" />
            외부 링크 {isActiveLink ? '수정' : '삽입'}
          </DialogTitle>
          <DialogDescription>연결할 웹 주소(URL)를 입력하세요.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="post-editor-link-url">링크 주소 (URL)</FieldLabel>
            <Input
              ref={urlInputRef}
              id="post-editor-link-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </Field>

          {!hasSelection && !isActiveLink ? (
            <Field>
              <FieldLabel htmlFor="post-editor-link-label">표시할 텍스트 (선택)</FieldLabel>
              <Input
                id="post-editor-link-label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="비워 두면 입력한 주소가 그대로 표시됩니다."
              />
            </Field>
          ) : null}

          <DialogFooter className="flex-wrap justify-between gap-2 pt-1">
            {isActiveLink ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="gap-1"
                onClick={() => {
                  onRemove?.();
                  onClose?.();
                }}
              >
                <Trash2 className="size-3.5" />
                링크 제거
              </Button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={!url.trim()}>
                적용
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

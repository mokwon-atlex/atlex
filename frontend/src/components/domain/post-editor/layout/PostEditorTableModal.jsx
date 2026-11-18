'use client';

// [Section] 표 생성 및 삭제 모달 — window.prompt 대신 행/열 수를 입력받고, 표 내부에서는 삭제 버튼도 제공한다.
import { useEffect, useRef, useState } from 'react';
import { Table2, Trash2 } from 'lucide-react';

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
 * 표 삽입 및 삭제를 위한 모달.
 *
 * @param {object} props
 * @param {boolean} props.isOpen 모달 열림 여부
 * @param {boolean} [props.isTableActive] 현재 커서가 표 내부에 있는지 여부
 * @param {() => void} props.onClose 닫기 핸들러
 * @param {(payload: { rows: number, cols: number }) => void} props.onInsert 표 삽입 핸들러
 * @param {() => void} [props.onDeleteTable] 현재 표 삭제 핸들러
 */
export default function PostEditorTableModal({ isOpen, isTableActive = false, onClose, onInsert, onDeleteTable }) {
  const [rows, setRows] = useState('3');
  const [cols, setCols] = useState('3');
  const rowsInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setRows('3');
      setCols('3');
      const timerId = window.setTimeout(() => {
        rowsInputRef.current?.focus();
      }, 40);
      return () => window.clearTimeout(timerId);
    }
  }, [isOpen]);

  function handleSubmit(e) {
    e.preventDefault();
    const parsedRows = Math.min(20, Math.max(1, Number.parseInt(rows, 10) || 3));
    const parsedCols = Math.min(12, Math.max(1, Number.parseInt(cols, 10) || 3));
    onInsert?.({ rows: parsedRows, cols: parsedCols });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && onClose?.()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Table2 className="size-4" />
            {isTableActive ? '표 관리' : '표 삽입'}
          </DialogTitle>
          <DialogDescription>
            {isTableActive
              ? '표 안에는 새 표를 삽입할 수 없습니다. 현재 표를 삭제할 수 있습니다.'
              : '삽입할 표의 행과 열 개수를 입력하세요.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isTableActive ? (
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="post-editor-table-rows">행 (Rows)</FieldLabel>
                <Input
                  ref={rowsInputRef}
                  id="post-editor-table-rows"
                  type="number"
                  min={1}
                  max={20}
                  value={rows}
                  onChange={(e) => setRows(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="post-editor-table-cols">열 (Columns)</FieldLabel>
                <Input
                  id="post-editor-table-cols"
                  type="number"
                  min={1}
                  max={12}
                  value={cols}
                  onChange={(e) => setCols(e.target.value)}
                />
              </Field>
            </div>
          ) : null}

          <DialogFooter className="flex-wrap justify-between gap-2 pt-1">
            {isTableActive ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="gap-1"
                onClick={() => {
                  onDeleteTable?.();
                  onClose?.();
                }}
              >
                <Trash2 className="size-3.5" />
                현재 표 삭제
              </Button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {isTableActive ? '닫기' : '취소'}
              </Button>
              {!isTableActive ? <Button type="submit">삽입</Button> : null}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

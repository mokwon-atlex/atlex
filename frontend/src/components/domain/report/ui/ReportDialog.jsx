'use client';

// 게시물·댓글 신고 다이얼로그.
// 사유 선택과 추가 설명 입력 후 신고를 접수하고, 접수 완료 또는 서버 오류(중복 신고 등)를 안내한다.

import { useState } from 'react';
import { Button } from '@/components/common/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog';
import { Textarea } from '@/components/common/ui/textarea';
import {
  REPORT_DESCRIPTION_MAX_LENGTH,
  REPORT_REASON_OPTIONS,
  REPORT_REASON_OTHER,
  REPORT_TARGET_TYPE_LABELS,
} from '@/data/report/report-options';
import { useCreateReport } from '@/hooks/queries/reports/useCreateReport';

/**
 * 신고 사유와 추가 설명을 입력받아 신고를 접수하는 다이얼로그.
 * 다이얼로그를 닫으면 입력 상태를 초기화해 다음 신고에 이전 입력이 남지 않게 한다.
 *
 * @param {object} props
 * @param {boolean} props.open - 다이얼로그 열림 여부
 * @param {(open: boolean) => void} props.onOpenChange - 열림 상태 변경 콜백
 * @param {'POST'|'COMMENT'} props.targetType - 신고 대상 종류
 * @param {number|string} props.targetId - 신고 대상 ID
 * @returns {JSX.Element} 신고 다이얼로그
 */
export function ReportDialog({ open, onOpenChange, targetType, targetId }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { mutateAsync: createReport, isPending } = useCreateReport();

  const targetLabel = REPORT_TARGET_TYPE_LABELS[targetType] ?? '콘텐츠';
  const trimmedDescription = description.trim();
  // 기타 사유는 서버에서도 설명을 필수로 검증하므로 미리 제출을 막는다.
  const isDescriptionRequired = reason === REPORT_REASON_OTHER;
  const canSubmit = Boolean(reason) && (!isDescriptionRequired || Boolean(trimmedDescription)) && !isPending;
  const descriptionId = `report-description-${targetType}-${targetId}`;

  function resetForm() {
    setReason('');
    setDescription('');
    setErrorMessage('');
    setIsSubmitted(false);
  }

  function handleOpenChange(nextOpen) {
    // 접수 요청 중에는 닫히지 않게 막아 결과 안내가 사라지지 않게 한다.
    if (isPending) return;
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setErrorMessage('');
    try {
      await createReport({
        targetType,
        targetId,
        reason,
        description: trimmedDescription || undefined,
      });
      setIsSubmitted(true);
    } catch (err) {
      setErrorMessage(err?.message || '신고 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="md" showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{targetLabel} 신고</DialogTitle>
          <DialogDescription>
            {isSubmitted
              ? '신고가 접수되었습니다. 관리자가 확인 후 처리합니다.'
              : '신고 사유를 선택해 주세요. 허위 신고는 제재 대상이 될 수 있습니다.'}
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <DialogFooter>
            <Button type="button" onClick={() => handleOpenChange(false)}>
              확인
            </Button>
          </DialogFooter>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="space-y-2" disabled={isPending}>
              <legend className="mb-2 text-sm font-medium text-foreground">신고 사유</legend>
              {REPORT_REASON_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm transition-colors hover:bg-accent has-checked:border-primary has-checked:bg-primary/5"
                >
                  <input
                    type="radio"
                    name={`report-reason-${targetType}-${targetId}`}
                    value={option.value}
                    checked={reason === option.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="accent-primary"
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>

            <div className="space-y-1.5">
              <label htmlFor={descriptionId} className="text-sm font-medium text-foreground">
                추가 설명 {isDescriptionRequired ? '(필수)' : '(선택)'}
              </label>
              <Textarea
                id={descriptionId}
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, REPORT_DESCRIPTION_MAX_LENGTH))}
                maxLength={REPORT_DESCRIPTION_MAX_LENGTH}
                disabled={isPending}
                rows={3}
                placeholder="신고 내용을 구체적으로 적어 주시면 처리에 도움이 됩니다."
                className="w-full resize-none bg-background"
              />
              <p className="text-right text-xs text-muted-foreground">
                {description.length} / {REPORT_DESCRIPTION_MAX_LENGTH}자
              </p>
            </div>

            {errorMessage && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {errorMessage}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                취소
              </Button>
              <Button type="submit" variant="destructive" disabled={!canSubmit}>
                {isPending ? '접수 중...' : '신고하기'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

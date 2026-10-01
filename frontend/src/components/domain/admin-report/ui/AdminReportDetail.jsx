'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/common/ui/button';
import { Textarea } from '@/components/common/ui/textarea';
import {
  getReportReasonLabel,
  REPORT_RESULT_MEMO_MAX_LENGTH,
  REPORT_TARGET_TYPE_LABELS,
} from '@/data/report/report-options';
import { formatReportDate } from '@/lib/report/report-format';
import { useAdminReport, useProcessReport } from '@/hooks/queries/reports/useAdminReports';
import { AdminReportStatusBadge } from '@/components/domain/admin-report/ui/AdminReportStatusBadge';

/**
 * 라벨과 값을 한 줄로 보여주는 상세 정보 항목.
 */
function DetailRow({ label, children }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words text-foreground">{children}</dd>
    </div>
  );
}

/**
 * 신고 처리 폼. 처리 결과(조치 완료·기각)와 메모를 입력받는다.
 *
 * @param {object} props
 * @param {number} props.reportId - 처리할 신고 ID
 */
function AdminReportProcessForm({ reportId }) {
  const [resultMemo, setResultMemo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { mutateAsync: processReport, isPending } = useProcessReport();
  const trimmedMemo = resultMemo.trim();
  const memoId = `report-result-memo-${reportId}`;

  async function handleProcess(status) {
    if (!trimmedMemo || isPending) return;
    setErrorMessage('');
    try {
      await processReport({ reportId, status, resultMemo: trimmedMemo });
      setResultMemo('');
    } catch (err) {
      setErrorMessage(err?.message || '신고 처리에 실패했습니다. 다시 시도해 주세요.');
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-3 border-t border-border pt-4">
      <label htmlFor={memoId} className="text-sm font-medium text-foreground">
        처리 메모 (필수)
      </label>
      <Textarea
        id={memoId}
        value={resultMemo}
        onChange={(e) => setResultMemo(e.target.value.slice(0, REPORT_RESULT_MEMO_MAX_LENGTH))}
        maxLength={REPORT_RESULT_MEMO_MAX_LENGTH}
        disabled={isPending}
        rows={3}
        placeholder="판단 근거와 조치 내용을 기록해 주세요."
        className="w-full resize-none bg-background"
      />
      <p className="text-xs text-muted-foreground">
        처리 결과는 한 번만 기록할 수 있습니다. 콘텐츠 숨김 등 실제 조치는 별도로 진행해야 합니다.
      </p>
      {errorMessage && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {errorMessage}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!trimmedMemo || isPending}
          onClick={() => handleProcess('REJECTED')}
        >
          기각
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={!trimmedMemo || isPending}
          onClick={() => handleProcess('RESOLVED')}
        >
          {isPending ? '처리 중...' : '조치 완료'}
        </Button>
      </div>
    </form>
  );
}

/**
 * 관리자 신고 상세 패널. 신고 정보, 신고 대상 요약, 처리 결과 또는 처리 폼을 보여준다.
 *
 * @param {object} props
 * @param {number|null} props.reportId - 선택된 신고 ID
 * @returns {JSX.Element} 신고 상세 패널
 */
export function AdminReportDetail({ reportId }) {
  const { data, isLoading, isError, refetch } = useAdminReport(reportId);

  if (reportId == null) {
    return <p className="py-12 text-center text-sm text-muted-foreground">목록에서 신고를 선택해 주세요.</p>;
  }

  if (isLoading) {
    return <p className="py-12 text-center text-sm text-muted-foreground">신고 정보를 불러오는 중입니다...</p>;
  }

  if (isError || !data) {
    return (
      <div className="py-12 text-center">
        <p className="mb-3 text-sm text-destructive">신고 정보를 불러오지 못했습니다.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          다시 시도
        </Button>
      </div>
    );
  }

  const { report, target } = data;
  const isPending = report.status === 'PENDING';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">신고 #{report.id}</h2>
        <AdminReportStatusBadge status={report.status} />
      </div>

      <dl className="space-y-2">
        <DetailRow label="대상">
          {REPORT_TARGET_TYPE_LABELS[report.targetType]} #{report.targetId}
        </DetailRow>
        <DetailRow label="사유">{getReportReasonLabel(report.reason)}</DetailRow>
        <DetailRow label="추가 설명">{report.description || '-'}</DetailRow>
        <DetailRow label="신고자">
          {report.reporterName} (@{report.reporterUserId})
        </DetailRow>
        <DetailRow label="신고 일시">{formatReportDate(report.createdAt)}</DetailRow>
      </dl>

      <section aria-label="신고 대상 내용" className="space-y-2 rounded-lg border border-border/70 bg-muted/30 p-3">
        {target ? (
          <>
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                작성자 {target.authorName} (@{target.authorUserId})
              </span>
              {target.deleted && <span className="font-semibold text-destructive">삭제됨</span>}
            </div>
            <p className="whitespace-pre-wrap break-words text-sm text-foreground">{target.preview}</p>
            {!target.deleted && (
              <Link
                href={`/@${target.postAuthorUserId}/${target.postId}`}
                className="inline-block text-xs font-semibold text-primary underline-offset-4 hover:underline"
              >
                게시글에서 확인하기
              </Link>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">신고 대상 정보를 찾을 수 없습니다.</p>
        )}
      </section>

      {isPending ? (
        <AdminReportProcessForm key={report.id} reportId={report.id} />
      ) : (
        <dl className="space-y-2 border-t border-border pt-4">
          <DetailRow label="처리자">@{report.processedByUserId}</DetailRow>
          <DetailRow label="처리 일시">{formatReportDate(report.processedAt)}</DetailRow>
          <DetailRow label="처리 메모">{report.resultMemo}</DetailRow>
        </dl>
      )}
    </div>
  );
}

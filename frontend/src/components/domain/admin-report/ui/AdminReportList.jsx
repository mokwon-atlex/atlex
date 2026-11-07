import { Button } from '@/components/common/ui/button';
import { cn } from '@/lib/utils';
import { getReportReasonLabel, REPORT_TARGET_TYPE_LABELS } from '@/data/report/report-options';
import { formatReportDate } from '@/lib/report/report-format';
import { AdminReportStatusBadge } from '@/components/domain/admin-report/ui/AdminReportStatusBadge';

/**
 * 관리자 신고 목록. 항목을 선택하면 상세 패널에서 확인·처리할 수 있다.
 *
 * @param {object} props
 * @param {import('@/lib/api/reports').AdminReport[]} props.reports - 현재 페이지의 신고 목록
 * @param {number|null} props.selectedReportId - 선택된 신고 ID
 * @param {(reportId: number) => void} props.onSelect - 신고 선택 콜백
 * @param {number} props.page - 현재 페이지(0부터 시작)
 * @param {number} props.totalPages - 전체 페이지 수
 * @param {(page: number) => void} props.onPageChange - 페이지 변경 콜백
 * @returns {JSX.Element} 신고 목록
 */
export function AdminReportList({ reports, selectedReportId, onSelect, page, totalPages, onPageChange }) {
  if (reports.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/70 py-12 text-center text-sm text-muted-foreground">
        조건에 맞는 신고가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {reports.map((report) => {
          const isSelected = report.id === selectedReportId;
          return (
            <li key={report.id}>
              <button
                type="button"
                onClick={() => onSelect(report.id)}
                aria-current={isSelected ? 'true' : undefined}
                className={cn(
                  'flex w-full flex-col gap-1.5 rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isSelected ? 'border-primary' : 'border-border/70',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {REPORT_TARGET_TYPE_LABELS[report.targetType]} #{report.targetId} ·{' '}
                    {getReportReasonLabel(report.reason)}
                  </span>
                  <AdminReportStatusBadge status={report.status} />
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    신고자 {report.reporterName} (@{report.reporterUserId})
                  </span>
                  <time dateTime={report.createdAt}>{formatReportDate(report.createdAt)}</time>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {totalPages > 1 && (
        <nav aria-label="신고 목록 페이지" className="flex items-center justify-center gap-3">
          <Button type="button" variant="outline" size="sm" disabled={page <= 0} onClick={() => onPageChange(page - 1)}>
            이전
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
          >
            다음
          </Button>
        </nav>
      )}
    </div>
  );
}

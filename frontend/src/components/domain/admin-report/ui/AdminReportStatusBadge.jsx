import { cva } from 'class-variance-authority';
import { REPORT_STATUS_LABELS } from '@/data/report/report-options';

/** 처리 상태별 배지 스타일. */
const statusBadgeVariants = cva('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', {
  variants: {
    status: {
      PENDING: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
      RESOLVED: 'bg-primary/10 text-primary',
      REJECTED: 'bg-muted text-muted-foreground',
    },
  },
});

/**
 * 신고 처리 상태 배지.
 * @param {object} props
 * @param {'PENDING'|'RESOLVED'|'REJECTED'} props.status - 처리 상태
 * @returns {JSX.Element} 상태 배지
 */
export function AdminReportStatusBadge({ status }) {
  return <span className={statusBadgeVariants({ status })}>{REPORT_STATUS_LABELS[status] ?? status}</span>;
}

'use client';

// 관리자 신고 관리 화면.
// 상태·대상 종류 필터와 페이지 단위 목록, 선택한 신고의 상세·처리 패널로 구성된다.

import { useEffect, useState } from 'react';
import Header from '@/components/common/layout/Header';
import RequireAuth from '@/components/common/auth/RequireAuth';
import { Button } from '@/components/common/ui/button';
import { REPORT_STATUS_LABELS, REPORT_TARGET_TYPE_LABELS } from '@/data/report/report-options';
import { useAdminReports } from '@/hooks/queries/reports/useAdminReports';
import { useAuthStore } from '@/store/authStore';
import { AdminReportList } from '@/components/domain/admin-report/ui/AdminReportList';
import { AdminReportDetail } from '@/components/domain/admin-report/ui/AdminReportDetail';

/** 상태 필터 선택지. 빈 값은 전체를 의미한다. */
const STATUS_FILTERS = [{ value: '', label: '전체' }].concat(
  Object.entries(REPORT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
);

/** 대상 종류 필터 선택지. 빈 값은 전체를 의미한다. */
const TARGET_TYPE_FILTERS = [{ value: '', label: '전체' }].concat(
  Object.entries(REPORT_TARGET_TYPE_LABELS).map(([value, label]) => ({ value, label })),
);

/**
 * 필터 버튼 그룹. 선택 상태는 aria-pressed로 전달한다.
 */
function FilterGroup({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-semibold text-muted-foreground">{label}</span>
      {options.map((option) => (
        <Button
          key={option.value || 'all'}
          type="button"
          size="sm"
          variant={value === option.value ? 'default' : 'outline'}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className="rounded-full"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

/**
 * 관리자 권한을 확인한 뒤 신고 관리 콘텐츠를 보여준다.
 * 화면 노출만 제어하며, 실제 권한 검사는 서버가 모든 관리자 API에서 수행한다.
 */
function AdminReportContent() {
  const role = useAuthStore((s) => s.user?.role);
  const [status, setStatus] = useState('PENDING');
  const [targetType, setTargetType] = useState('');
  const [page, setPage] = useState(0);
  const [selectedReportId, setSelectedReportId] = useState(null);

  const isAdmin = role === 'ADMIN';
  const { data, isLoading, isError, error, refetch } = useAdminReports(
    { status, targetType, page },
    { enabled: isAdmin },
  );
  const reports = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  // 필터 변경으로 현재 페이지가 범위를 벗어나면 마지막 페이지로 보정한다.
  useEffect(() => {
    if (totalPages > 0 && page > totalPages - 1) setPage(totalPages - 1);
  }, [page, totalPages]);

  if (!isAdmin) {
    return (
      <p role="alert" className="py-16 text-center text-sm text-muted-foreground">
        관리자만 접근할 수 있는 화면입니다.
      </p>
    );
  }

  function handleStatusChange(nextStatus) {
    setStatus(nextStatus);
    setPage(0);
  }

  function handleTargetTypeChange(nextTargetType) {
    setTargetType(nextTargetType);
    setPage(0);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">신고 관리</h1>
        <FilterGroup label="상태" options={STATUS_FILTERS} value={status} onChange={handleStatusChange} />
        <FilterGroup label="대상" options={TARGET_TYPE_FILTERS} value={targetType} onChange={handleTargetTypeChange} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <section aria-label="신고 목록">
          {isLoading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">신고 목록을 불러오는 중입니다...</p>
          ) : isError ? (
            <div className="py-12 text-center">
              <p role="alert" className="mb-3 text-sm text-destructive">
                {error?.message || '신고 목록을 불러오지 못했습니다.'}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                다시 시도
              </Button>
            </div>
          ) : (
            <AdminReportList
              reports={reports}
              selectedReportId={selectedReportId}
              onSelect={setSelectedReportId}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </section>

        <aside
          aria-label="신고 상세"
          className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-6 lg:self-start"
        >
          <AdminReportDetail reportId={selectedReportId} />
        </aside>
      </div>
    </div>
  );
}

/**
 * 관리자 신고 관리 페이지. 미로그인 사용자는 로그인 화면으로 이동한다.
 * @returns {JSX.Element} 신고 관리 페이지
 */
export function AdminReportPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,var(--muted),var(--background)_45%)]">
      <Header />
      <div className="mx-auto w-full max-w-content-narrow flex-1 px-5 pb-12 pt-7 sm:px-8 lg:px-10">
        <RequireAuth>
          <AdminReportContent />
        </RequireAuth>
      </div>
    </main>
  );
}

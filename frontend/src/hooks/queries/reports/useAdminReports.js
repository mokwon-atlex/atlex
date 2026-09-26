'use client';

// 관리자 신고 목록·상세 조회와 처리 mutation 훅.
// 처리 성공 시 목록과 상세 캐시를 모두 무효화해 상태 필터 결과가 즉시 갱신되게 한다.

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAdminReportApi, fetchAdminReportsApi, processAdminReportApi } from '@/lib/api/reports';

/** 관리자 신고 캐시의 공통 키 접두사. */
const ADMIN_REPORTS_KEY = ['admin', 'reports'];

/**
 * 관리자 신고 목록을 조회한다. 페이지 전환 중에는 이전 페이지를 유지해 깜빡임을 줄인다.
 * @param {{ status?: string, targetType?: string, page?: number }} filters - 조회 조건
 * @param {{ enabled?: boolean }} [options] - 관리자가 아닐 때 요청을 막기 위한 옵션
 */
export function useAdminReports(filters, { enabled = true } = {}) {
  return useQuery({
    queryKey: [...ADMIN_REPORTS_KEY, 'list', filters],
    queryFn: () => fetchAdminReportsApi(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/**
 * 관리자 신고 상세를 조회한다. reportId가 없으면 요청하지 않는다.
 * @param {number|string|null} reportId - 신고 ID
 */
export function useAdminReport(reportId) {
  return useQuery({
    queryKey: [...ADMIN_REPORTS_KEY, 'detail', String(reportId)],
    queryFn: () => fetchAdminReportApi(reportId),
    enabled: reportId != null,
  });
}

/**
 * 신고 처리 결과를 기록하는 mutation 훅.
 * @returns {import('@tanstack/react-query').UseMutationResult} mutate({ reportId, status, resultMemo })
 */
export function useProcessReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, status, resultMemo }) => processAdminReportApi(reportId, { status, resultMemo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_REPORTS_KEY });
    },
  });
}

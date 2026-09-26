import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';

import { apiClient } from '@/lib/api/client';
import { AdminReportDetail } from '@/components/domain/admin-report/ui/AdminReportDetail';

const pendingDetail = {
  report: {
    id: 1,
    targetType: 'COMMENT',
    targetId: 3,
    reason: 'SPAM',
    description: '같은 광고 댓글을 반복해서 작성합니다.',
    status: 'PENDING',
    reporterUserId: 'john123',
    reporterName: '홍길동',
    processedByUserId: null,
    resultMemo: null,
    processedAt: null,
    createdAt: '2026-09-20T10:30:00',
  },
  target: {
    postId: 10,
    postAuthorUserId: 'blogger',
    authorUserId: 'writer1',
    authorName: '작성자',
    preview: '무료 쿠폰 받아가세요',
    deleted: false,
  },
};

const resolvedDetail = {
  ...pendingDetail,
  report: {
    ...pendingDetail.report,
    status: 'RESOLVED',
    processedByUserId: 'admin',
    resultMemo: '광고성 댓글로 확인',
    processedAt: '2026-09-21T09:00:00',
  },
};

/** 관리자 처리 API 호출을 가로채는 spy. */
let processSpy;

function createQueryDecorator(detail) {
  return function QueryDecorator(Story) {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } },
    });
    queryClient.setQueryData(['admin', 'reports', 'detail', '1'], detail);
    return createElement(QueryClientProvider, { client: queryClient }, createElement(Story));
  };
}

/** @type { import('@storybook/nextjs-vite').Meta<typeof AdminReportDetail> } */
const meta = {
  title: 'Domain/AdminReport/UI/AdminReportDetail',
  component: AdminReportDetail,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { reportId: 1 },
  render: (args) => (
    <div className="w-[380px] rounded-xl border border-border bg-card p-5">
      <AdminReportDetail {...args} />
    </div>
  ),
};

export default meta;

export const Pending = {
  decorators: [createQueryDecorator(pendingDetail)],
  beforeEach: () => {
    processSpy = spyOn(apiClient, 'patch').mockImplementation(async () => resolvedDetail.report);
    return () => {
      processSpy.mockRestore();
      processSpy = undefined;
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('link', { name: '게시글에서 확인하기' })).toHaveAttribute('href', '/@blogger/10');
    await expect(canvas.getByRole('button', { name: '조치 완료' })).toBeDisabled();

    await userEvent.type(canvas.getByLabelText(/처리 메모/), '광고성 댓글로 확인');
    await userEvent.click(canvas.getByRole('button', { name: '조치 완료' }));

    await waitFor(() =>
      expect(processSpy).toHaveBeenCalledWith('/admin/reports/1', {
        status: 'RESOLVED',
        resultMemo: '광고성 댓글로 확인',
      }),
    );
  },
};

export const Processed = {
  decorators: [createQueryDecorator(resolvedDetail)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('광고성 댓글로 확인')).toBeVisible();
    await expect(canvas.queryByRole('button', { name: '조치 완료' })).toBeNull();
  },
};

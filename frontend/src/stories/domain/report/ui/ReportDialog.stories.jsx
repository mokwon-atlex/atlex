import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';

import { apiClient } from '@/lib/api/client';
import { ReportDialog } from '@/components/domain/report/ui/ReportDialog';

/** 신고 API 호출을 가로채는 spy. 스토리 종료 시 원복한다. */
let reportPostSpy;

/**
 * 신고 API 응답을 지정한다.
 * @param {(url: string, body: object) => Promise<object>} implementation - 모킹 구현
 */
function mockReportApi(implementation) {
  return function setupReportApi() {
    reportPostSpy = spyOn(apiClient, 'post').mockImplementation(implementation);
    return () => {
      reportPostSpy.mockRestore();
      reportPostSpy = undefined;
    };
  };
}

/**
 * 다이얼로그가 열리며 초기 포커스를 옮긴 뒤에 상호작용하도록 기다린다.
 * 초기 포커스 이동 전에 입력하면 입력 도중 포커스가 바뀌어 일부 글자가 유실될 수 있다.
 * @param {HTMLElement} canvasElement - 스토리 캔버스
 * @returns {Promise<ReturnType<typeof within>>} 문서 전체 쿼리
 */
async function waitForDialogReady(canvasElement) {
  const screen = within(canvasElement.ownerDocument.body);
  const dialog = await screen.findByRole('dialog');
  await waitFor(() => expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(true));
  return screen;
}

function QueryDecorator(Story) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client: queryClient }, createElement(Story));
}

/** @type { import('@storybook/nextjs-vite').Meta<typeof ReportDialog> } */
const meta = {
  title: 'Domain/Report/UI/ReportDialog',
  component: ReportDialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [QueryDecorator],
  args: { open: true, onOpenChange: () => {}, targetType: 'POST', targetId: 10 },
};

export default meta;

export const Default = {};

export const SubmitPostReport = {
  beforeEach: mockReportApi(async () => ({ id: 1, status: 'PENDING' })),
  play: async ({ canvasElement }) => {
    const screen = await waitForDialogReady(canvasElement);

    await userEvent.click(await screen.findByRole('radio', { name: '스팸·광고' }));
    const descriptionInput = screen.getByLabelText(/추가 설명/);
    await userEvent.type(descriptionInput, '  광고 링크 반복  ');
    await expect(descriptionInput).toHaveValue('  광고 링크 반복  ');
    await userEvent.click(screen.getByRole('button', { name: '신고하기' }));

    await waitFor(() =>
      expect(reportPostSpy).toHaveBeenCalledWith('/posts/10/reports', {
        reason: 'SPAM',
        description: '광고 링크 반복',
      }),
    );
    await expect(await screen.findByText(/신고가 접수되었습니다/)).toBeVisible();
  },
};

export const OtherReasonRequiresDescription = {
  args: { targetType: 'COMMENT', targetId: 3 },
  play: async ({ canvasElement }) => {
    const screen = await waitForDialogReady(canvasElement);

    await userEvent.click(await screen.findByRole('radio', { name: '기타' }));
    await expect(screen.getByRole('button', { name: '신고하기' })).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/추가 설명 \(필수\)/), '사칭 계정');
    await expect(screen.getByRole('button', { name: '신고하기' })).toBeEnabled();
  },
};

export const DuplicateReport = {
  beforeEach: mockReportApi(async () => {
    const error = new Error('이미 신고한 대상입니다.');
    error.code = 'DUPLICATE_REPORT';
    throw error;
  }),
  play: async ({ canvasElement }) => {
    const screen = await waitForDialogReady(canvasElement);

    await userEvent.click(await screen.findByRole('radio', { name: '욕설·혐오·괴롭힘' }));
    await userEvent.click(screen.getByRole('button', { name: '신고하기' }));

    await expect(await screen.findByRole('alert')).toHaveTextContent('이미 신고한 대상입니다.');
  },
};

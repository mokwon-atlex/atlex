import { useLayoutEffect } from 'react';
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test';

import { AdminActions } from '@/components/domain/blog-detail/ui/AdminActions';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';

function resetAuthStore() {
  useAuthStore.setState({
    isLoggedIn: false,
    user: null,
    accessToken: null,
    refreshToken: null,
  });
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('auth-storage');
  }
}

function AdminActionsWrapper({
  isLoggedIn = true,
  currentUserId = 'author1',
  authorUserId = 'author1',
  postId = '123',
  actions = ['통계', '수정', '삭제'],
  onDelete,
  onDeleteSuccess,
  onDeleteError,
}) {
  useLayoutEffect(() => {
    useAuthStore.setState({
      isLoggedIn,
      user: isLoggedIn ? { userId: currentUserId } : null,
      accessToken: isLoggedIn ? 'dummy-token' : null,
      refreshToken: null,
    });

    return () => {
      resetAuthStore();
    };
  }, [isLoggedIn, currentUserId]);

  return (
    <div className="flex min-h-64 w-full items-center justify-center p-8">
      <AdminActions
        authorUserId={authorUserId}
        postId={postId}
        actions={actions}
        onDelete={onDelete}
        onDeleteSuccess={onDeleteSuccess}
        onDeleteError={onDeleteError}
      />
    </div>
  );
}

/** @type { import('@storybook/nextjs-vite').Meta<typeof AdminActionsWrapper> } */
const meta = {
  title: 'Domain/BlogDetail/UI/AdminActions',
  component: AdminActionsWrapper,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;

/**
 * 작성자가 조회할 때 관리자 액션 버튼들이 노출되는 기본 스토리입니다.
 */
export const AuthorView = {
  args: {
    isLoggedIn: true,
    currentUserId: 'author1',
    authorUserId: 'author1',
    postId: '123',
  },
  play: async ({ canvasElement }) => {
    try {
      const canvas = within(canvasElement);

      await expect(canvas.getByRole('button', { name: '삭제' })).toBeVisible();
      await expect(canvas.getByRole('button', { name: '수정' })).toBeVisible();
      await expect(canvas.getByRole('button', { name: '통계' })).toBeVisible();
    } finally {
      resetAuthStore();
    }
  },
};

/**
 * 작성자가 아닌 다른 로그인 유저에게는 관리자 액션이 노출되지 않는 스토리입니다.
 */
export const NonAuthorView = {
  args: {
    isLoggedIn: true,
    currentUserId: 'otherUser',
    authorUserId: 'author1',
    postId: '123',
  },
  play: async ({ canvasElement }) => {
    try {
      const canvas = within(canvasElement);

      await expect(canvas.queryByRole('button', { name: '삭제' })).toBeNull();
    } finally {
      resetAuthStore();
    }
  },
};

/**
 * 비로그인 사용자에게는 관리자 액션이 노출되지 않는 스토리입니다.
 */
export const LoggedOutView = {
  args: {
    isLoggedIn: false,
    currentUserId: null,
    authorUserId: 'author1',
    postId: '123',
  },
  play: async ({ canvasElement }) => {
    try {
      const canvas = within(canvasElement);

      await expect(canvas.queryByRole('button', { name: '삭제' })).toBeNull();
    } finally {
      resetAuthStore();
    }
  },
};

/**
 * 삭제 버튼 클릭 시 확인 모달이 열리고 취소 시 모달이 닫히며 화면이 유지되는 스토리입니다.
 */
export const OpenAndCancelDeleteModal = {
  args: {
    isLoggedIn: true,
    currentUserId: 'author1',
    authorUserId: 'author1',
    postId: '123',
  },
  play: async ({ canvasElement }) => {
    try {
      const canvas = within(canvasElement);
      const deleteButton = canvas.getByRole('button', { name: '삭제' });

      // 삭제 버튼 클릭하여 확인 모달 열기
      await userEvent.click(deleteButton);

      const body = within(canvasElement.ownerDocument.body);
      const dialogTitle = await body.findByText('게시글을 삭제하시겠습니까?');
      await waitFor(() => {
        expect(dialogTitle).toBeVisible();
      });

      // 취소 버튼 클릭하여 모달 닫기
      const cancelButton = body.getByRole('button', { name: '취소' });
      await userEvent.click(cancelButton);

      // 모달이 닫히고 기존 화면(삭제 버튼)이 유지되는지 검증
      await waitFor(() => {
        expect(body.queryByText('게시글을 삭제하시겠습니까?')).toBeNull();
      });
      await expect(canvas.getByRole('button', { name: '삭제' })).toBeVisible();
    } finally {
      resetAuthStore();
    }
  },
};

/**
 * 삭제 확인 모달에서 삭제 버튼을 누르면 API 호출 및 성공 콜백이 수행되는 스토리입니다.
 */
export const ConfirmDeleteSuccess = {
  args: {
    isLoggedIn: true,
    currentUserId: 'author1',
    authorUserId: 'author1',
    postId: '123',
    onDeleteSuccess: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const deleteSpy = spyOn(apiClient, 'delete').mockImplementation(async (url) => {
      if (url === '/posts/123') {
        return {};
      }
      return {};
    });

    try {
      const canvas = within(canvasElement);
      const deleteTrigger = canvas.getByRole('button', { name: '삭제' });

      // 삭제 모달 열기
      await userEvent.click(deleteTrigger);

      const body = within(canvasElement.ownerDocument.body);
      const confirmButton = await body.findByRole('button', { name: '삭제' });

      // 확인 모달의 삭제 버튼 클릭
      await userEvent.click(confirmButton);

      // API 호출 검증
      await waitFor(() => {
        expect(deleteSpy).toHaveBeenCalledWith('/posts/123');
      });

      // 성공 콜백 호출 검증
      await waitFor(() => {
        expect(args.onDeleteSuccess).toHaveBeenCalled();
      });

      // 모달이 닫혔는지 검증
      await waitFor(() => {
        expect(body.queryByText('게시글을 삭제하시겠습니까?')).toBeNull();
      });
    } finally {
      deleteSpy.mockRestore();
      resetAuthStore();
    }
  },
};

/**
 * 삭제 실패 시 모달이 닫히지 않고 오류 안내 메시지가 표시되며 화면이 유지되는 스토리입니다.
 */
export const ConfirmDeleteFailure = {
  args: {
    isLoggedIn: true,
    currentUserId: 'author1',
    authorUserId: 'author1',
    postId: '123',
    onDeleteError: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const deleteSpy = spyOn(apiClient, 'delete').mockImplementation(async () => {
      const error = new Error('게시글 삭제 권한이 없거나 이미 삭제되었습니다.');
      throw error;
    });

    try {
      const canvas = within(canvasElement);
      const deleteTrigger = canvas.getByRole('button', { name: '삭제' });

      // 삭제 모달 열기
      await userEvent.click(deleteTrigger);

      const body = within(canvasElement.ownerDocument.body);
      const confirmButton = await body.findByRole('button', { name: '삭제' });

      // 확인 모달의 삭제 버튼 클릭
      await userEvent.click(confirmButton);

      // 에러 메시지가 모달 내에 표시되는지 검증
      const errorMessage = await body.findByText('게시글 삭제 권한이 없거나 이미 삭제되었습니다.');
      await waitFor(() => {
        expect(errorMessage).toBeVisible();
      });

      // 에러 콜백 호출 검증
      await expect(args.onDeleteError).toHaveBeenCalled();

      // 모달이 닫히지 않고 여전히 화면에 남아있는지 검증
      await waitFor(() => {
        expect(body.getByText('게시글을 삭제하시겠습니까?')).toBeVisible();
      });
    } finally {
      deleteSpy.mockRestore();
      resetAuthStore();
    }
  },
};

/**
 * 삭제 요청 진행 중일 때 버튼이 비활성화되고 '삭제 중...' 텍스트가 표시되는 스토리입니다.
 */
export const DeletingStateShowsPendingStatus = {
  args: {
    isLoggedIn: true,
    currentUserId: 'author1',
    authorUserId: 'author1',
    postId: '123',
  },
  play: async ({ canvasElement }) => {
    let resolveDelete;
    const deletePromise = new Promise((resolve) => {
      resolveDelete = resolve;
    });

    const deleteSpy = spyOn(apiClient, 'delete').mockImplementation(() => deletePromise);

    try {
      const canvas = within(canvasElement);
      const deleteTrigger = canvas.getByRole('button', { name: '삭제' });
      await userEvent.click(deleteTrigger);

      const body = within(canvasElement.ownerDocument.body);
      const confirmButton = await body.findByRole('button', { name: '삭제' });
      const cancelButton = body.getByRole('button', { name: '취소' });

      // 삭제 확인 버튼 클릭
      await userEvent.click(confirmButton);

      // 처리 중 상태 검증: 버튼 텍스트 변경 및 disabled 상태
      await waitFor(() => {
        expect(body.getByRole('button', { name: '삭제 중...' })).toBeDisabled();
      });
      await expect(cancelButton).toBeDisabled();

      // 요청 완료
      resolveDelete({});

      // 완료 후 모달이 닫히는지 검증
      await waitFor(() => {
        expect(body.queryByText('게시글을 삭제하시겠습니까?')).toBeNull();
      });
    } finally {
      deleteSpy.mockRestore();
      resetAuthStore();
    }
  },
};

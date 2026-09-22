import { AdminActions } from '@/components/domain/blog-detail/ui/AdminActions';
import { useAuthStore } from '@/store/authStore';
import { expect, waitFor, within } from 'storybook/test';

// NOTE: useAuthStore 는 zustand 전역 스토어라 컴포넌트에 prop 으로 주입할 수 없다.
// play() 안에서 useAuthStore.setState(...) 로 직접 값을 바꿔 로그인/작성자 상태를 재현한다.
// setState 이후 리렌더링은 즉시 반영되지 않을 수 있어, 단순 getByRole/queryByRole 대신
// findByRole(자동 재시도) 또는 waitFor 로 감싸서 리렌더링을 기다린 뒤 검증한다.

/** @type { import('@storybook/nextjs-vite').Meta<typeof AdminActions> } */
const meta = {
  title: 'Domain/BlogDetail/UI/AdminActions',
  component: AdminActions,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    authorUserId: { control: 'text' },
    postId: { control: 'number' },
  },
  args: {
    authorUserId: 'john123',
    postId: 42,
    actions: ['통계', '수정', '삭제'],
  },
};

export default meta;

// 로그인한 본인 글일 때: 수정 버튼이 /write/{postId} 로 가는 링크로 렌더링되는지 확인.
export const AsAuthor = {
  play: async ({ canvasElement, args }) => {
    useAuthStore.setState({ isLoggedIn: true, user: { userId: args.authorUserId } });

    const canvas = within(canvasElement);
    // findByRole 은 리렌더링이 반영될 때까지 자동으로 재시도한다.
    const editLink = await canvas.findByRole('link', { name: '수정' });

    await expect(editLink).toHaveAttribute('href', `/write/${args.postId}`);

    // 아직 목적지가 없는 액션들은 링크가 아닌 일반 버튼으로 남아 있어야 한다.
    // (Button이 Link 안에 중첩되면 getByRole('button')도 통과해 버리므로, 링크로는
    //  렌더링되지 않았는지도 함께 확인해 회귀를 잡는다)
    await expect(canvas.getByRole('button', { name: '통계' })).toBeVisible();
    await expect(canvas.queryByRole('link', { name: '통계' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: '삭제' })).toBeVisible();
    await expect(canvas.queryByRole('link', { name: '삭제' })).not.toBeInTheDocument();
  },
};

// 로그인은 했지만 작성자 본인이 아닐 때: 아무 것도 렌더링되지 않아야 한다.
export const AsOtherUser = {
  play: async ({ canvasElement, args }) => {
    useAuthStore.setState({ isLoggedIn: true, user: { userId: 'someone-else' } });

    const canvas = within(canvasElement);

    await waitFor(() => {
      for (const action of args.actions) {
        expect(canvas.queryByRole('button', { name: action })).not.toBeInTheDocument();
        expect(canvas.queryByRole('link', { name: action })).not.toBeInTheDocument();
      }
    });
  },
};

// 비로그인 상태: 마찬가지로 아무 것도 렌더링되지 않아야 한다.
export const LoggedOut = {
  play: async ({ canvasElement, args }) => {
    useAuthStore.setState({ isLoggedIn: false, user: null });

    const canvas = within(canvasElement);

    await waitFor(() => {
      for (const action of args.actions) {
        expect(canvas.queryByRole('button', { name: action })).not.toBeInTheDocument();
        expect(canvas.queryByRole('link', { name: action })).not.toBeInTheDocument();
      }
    });
  },
};

import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BlogDetailComments } from '@/components/domain/blog-detail/ui/BlogDetailComments';
import { useAuthStore } from '@/store/authStore';

const mockComments = [
  {
    id: 1,
    postId: 10,
    content: '좋은 글 잘 읽었습니다! 많은 도움이 되었습니다.',
    authorId: 1,
    authorUserId: 'tech-guru',
    authorName: '테크마스터',
    createdAt: '2026-03-20T10:30:00',
    updatedAt: '2026-03-20T10:30:00',
  },
  {
    id: 2,
    postId: 10,
    content: '본인이 작성한 댓글 예시입니다. 수정과 삭제 버튼이 노출됩니다.',
    authorId: 2,
    authorUserId: 'my-account',
    authorName: '홍길동',
    createdAt: '2026-03-21T14:15:00',
    updatedAt: '2026-03-21T14:40:00',
  },
];

function createQueryDecorator(comments = [], { isLoggedIn = true, userId = 'my-account' } = {}) {
  return function QueryDecorator(Story) {
    useAuthStore.setState({
      isLoggedIn,
      user: isLoggedIn ? { userId } : null,
      accessToken: isLoggedIn ? 'mock-token' : null,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(['posts', '10', 'comments'], comments);

    return createElement(QueryClientProvider, { client: queryClient }, createElement(Story));
  };
}

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogDetailComments> } */
const meta = {
  title: 'Domain/BlogDetail/UI/BlogDetailComments',
  component: BlogDetailComments,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;

export const Default = {
  decorators: [createQueryDecorator(mockComments, { isLoggedIn: true, userId: 'my-account' })],
  render: () => (
    <div className="w-[780px]">
      <BlogDetailComments postId="10" postAuthorUserId="my-account" />
    </div>
  ),
};

export const NotLoggedIn = {
  decorators: [createQueryDecorator(mockComments, { isLoggedIn: false })],
  render: () => (
    <div className="w-[780px]">
      <BlogDetailComments postId="10" />
    </div>
  ),
};

export const Empty = {
  decorators: [createQueryDecorator([], { isLoggedIn: true, userId: 'my-account' })],
  render: () => (
    <div className="w-[780px]">
      <BlogDetailComments postId="10" />
    </div>
  ),
};

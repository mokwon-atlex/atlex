import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';

import { apiClient } from '@/lib/api/client';
import { BlogDetailComments } from '@/components/domain/blog-detail/ui/BlogDetailComments';
import { useAuthStore } from '@/store/authStore';

const mockComments = [
  {
    id: 1,
    postId: 10,
    parentId: null,
    deleted: false,
    content: '좋은 글 잘 읽었습니다! 많은 도움이 되었습니다.',
    authorId: 1,
    authorUserId: 'tech-guru',
    authorName: '테크마스터',
    createdAt: '2026-03-20T10:30:00',
    updatedAt: '2026-03-20T10:30:00',
    replies: [],
  },
  {
    id: 2,
    postId: 10,
    parentId: null,
    deleted: false,
    content: '본인이 작성한 댓글 예시입니다. 수정과 삭제 버튼이 노출됩니다.',
    authorId: 2,
    authorUserId: 'my-account',
    authorName: '홍길동',
    createdAt: '2026-03-21T14:15:00',
    updatedAt: '2026-03-21T14:40:00',
    replies: [],
  },
];

/** 답글과 답글이 남은 삭제 댓글을 포함한 목록. */
const mockCommentsWithReplies = [
  {
    ...mockComments[0],
    replies: [
      {
        id: 3,
        postId: 10,
        parentId: 1,
        deleted: false,
        content: '저도 같은 생각입니다. 좋은 글이네요.',
        authorId: 2,
        authorUserId: 'my-account',
        authorName: '홍길동',
        createdAt: '2026-03-20T11:00:00',
        updatedAt: '2026-03-20T11:00:00',
      },
    ],
  },
  {
    id: 4,
    postId: 10,
    parentId: null,
    deleted: true,
    content: null,
    authorId: null,
    authorUserId: null,
    authorName: null,
    createdAt: '2026-03-21T09:00:00',
    updatedAt: null,
    replies: [
      {
        id: 5,
        postId: 10,
        parentId: 4,
        deleted: false,
        content: '부모 댓글이 삭제돼도 답글은 남아 있습니다.',
        authorId: 1,
        authorUserId: 'tech-guru',
        authorName: '테크마스터',
        createdAt: '2026-03-21T10:00:00',
        updatedAt: '2026-03-21T10:00:00',
      },
    ],
  },
];

/** 댓글 작성 API 호출을 가로채는 spy. 스토리 종료 시 원복한다. */
let createCommentSpy;

/** 댓글 작성 API가 성공 응답을 반환하도록 모킹한다. */
function mockCreateCommentApi() {
  createCommentSpy = spyOn(apiClient, 'post').mockImplementation(async (url, body) => ({ id: 99, ...body }));
  // 작성 성공 후 무효화로 발생하는 재조회는 기존 목록을 그대로 돌려준다.
  const getSpy = spyOn(apiClient, 'get').mockImplementation(async () => mockCommentsWithReplies);
  return () => {
    createCommentSpy.mockRestore();
    getSpy.mockRestore();
    createCommentSpy = undefined;
  };
}

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

/** 답글은 부모 댓글 아래에 표시하고, 답글이 남은 삭제 댓글은 안내 문구로 자리를 유지한다. */
export const WithReplies = {
  decorators: [createQueryDecorator(mockCommentsWithReplies, { isLoggedIn: true, userId: 'my-account' })],
  render: () => (
    <div className="w-[780px]">
      <BlogDetailComments postId="10" postAuthorUserId="tech-guru" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 삭제 댓글을 제외한 살아있는 댓글 1개와 답글 2개를 센다.
    await expect(canvas.getByRole('heading', { name: '댓글 3' })).toBeVisible();
    await expect(canvas.getByText('삭제된 댓글입니다.')).toBeVisible();
    await expect(canvas.getByText('부모 댓글이 삭제돼도 답글은 남아 있습니다.')).toBeVisible();
    // 답글 버튼은 살아있는 최상위 댓글에만 노출한다.
    await expect(canvas.getAllByRole('button', { name: '답글' })).toHaveLength(1);
  },
};

/** 답글 폼에서 등록하면 부모 댓글 ID와 함께 작성 API를 호출한다. */
export const SubmitReply = {
  decorators: [createQueryDecorator(mockCommentsWithReplies, { isLoggedIn: true, userId: 'my-account' })],
  beforeEach: mockCreateCommentApi,
  render: () => (
    <div className="w-[780px]">
      <BlogDetailComments postId="10" postAuthorUserId="tech-guru" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: '답글' }));
    await userEvent.type(canvas.getByLabelText('답글 작성'), '  답글 내용  ');
    await userEvent.click(canvas.getByRole('button', { name: '답글 등록' }));

    await waitFor(() =>
      expect(createCommentSpy).toHaveBeenCalledWith('/posts/10/comments', { content: '답글 내용', parentId: 1 }),
    );
    await waitFor(() => expect(canvas.queryByLabelText('답글 작성')).toBeNull());
  },
};

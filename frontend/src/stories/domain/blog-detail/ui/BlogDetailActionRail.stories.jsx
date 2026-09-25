import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';

import BlogDetailActionRail from '@/components/domain/blog-detail/ui/BlogDetailActionRail';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';

/**
 * 로그인 상태와 빈 댓글 캐시를 고정해, 좋아요 외의 요청이 스토리에 끼어들지 않게 한다.
 *
 * @param {Object} [options] - 데코레이터 옵션
 * @param {boolean} [options.isLoggedIn=true] - 로그인 여부
 * @returns {Function} 스토리 데코레이터
 */
function createAuthDecorator({ isLoggedIn = true } = {}) {
  return function AuthDecorator(Story) {
    useAuthStore.setState({
      isLoggedIn,
      user: isLoggedIn ? { userId: 'my-account' } : null,
      accessToken: isLoggedIn ? 'mock-token' : null,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(['posts', '10', 'comments'], []);

    return createElement(QueryClientProvider, { client: queryClient }, createElement(Story));
  };
}

let likeSpy;
let unlikeSpy;
let detailSpy;

/**
 * 좋아요 등록/해제 요청과 상태 보정용 상세 조회를 고정한다.
 *
 * @param {Object} [options] - 응답 옵션
 * @param {boolean} [options.liked=false] - 서버가 내려줄 현재 좋아요 여부
 * @param {number} [options.likes=18] - 서버가 내려줄 현재 좋아요 수
 * @param {boolean} [options.failToggle=false] - 토글 요청을 실패시킬지 여부
 * @returns {() => void} 스토리 종료 시 스파이를 되돌리는 정리 함수
 */
function setupLikeRequests({ liked = false, likes = 18, failToggle = false } = {}) {
  return () => {
    detailSpy = spyOn(apiClient, 'get').mockImplementation(async () => ({ id: 10, liked, likes }));

    likeSpy = spyOn(apiClient, 'post').mockImplementation(async () => {
      if (failToggle) throw new Error('좋아요 처리에 실패했습니다.');
      return { postId: 10, liked: true, likes: likes + 1 };
    });

    unlikeSpy = spyOn(apiClient, 'delete').mockImplementation(async () => {
      if (failToggle) throw new Error('좋아요 처리에 실패했습니다.');
      return { postId: 10, liked: false, likes: Math.max(0, likes - 1) };
    });

    return () => {
      detailSpy.mockRestore();
      likeSpy.mockRestore();
      unlikeSpy.mockRestore();
      detailSpy = undefined;
      likeSpy = undefined;
      unlikeSpy = undefined;
    };
  };
}

/**
 * 인증된 보정 조회를 지연시켜, 응답 전 클릭이 막히는지 확인할 수 있게 한다.
 *
 * @returns {() => void} 스토리 종료 시 스파이를 되돌리는 정리 함수
 */
function setupSlowLikeStateRequest() {
  return () => {
    detailSpy = spyOn(apiClient, 'get').mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { id: 10, liked: true, likes: 19 };
    });
    likeSpy = spyOn(apiClient, 'post').mockImplementation(async () => ({ postId: 10, liked: true, likes: 20 }));
    unlikeSpy = spyOn(apiClient, 'delete').mockImplementation(async () => ({ postId: 10, liked: false, likes: 18 }));

    return () => {
      detailSpy.mockRestore();
      likeSpy.mockRestore();
      unlikeSpy.mockRestore();
      detailSpy = undefined;
      likeSpy = undefined;
      unlikeSpy = undefined;
    };
  };
}

/**
 * 인증된 보정 조회를 실패시켜, 상태를 확보하지 못한 채 토글되지 않는지 확인한다.
 *
 * @returns {() => void} 스토리 종료 시 스파이를 되돌리는 정리 함수
 */
function setupFailingLikeStateRequest() {
  return () => {
    detailSpy = spyOn(apiClient, 'get').mockImplementation(async () => {
      throw new Error('상태 조회 실패');
    });
    likeSpy = spyOn(apiClient, 'post').mockImplementation(async () => ({ postId: 10, liked: true, likes: 19 }));
    unlikeSpy = spyOn(apiClient, 'delete').mockImplementation(async () => ({ postId: 10, liked: false, likes: 17 }));

    return () => {
      detailSpy.mockRestore();
      likeSpy.mockRestore();
      unlikeSpy.mockRestore();
      detailSpy = undefined;
      likeSpy = undefined;
      unlikeSpy = undefined;
    };
  };
}

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogDetailActionRail> } */
const meta = {
  title: 'Domain/BlogDetail/UI/BlogDetailActionRail',
  component: BlogDetailActionRail,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    likes: { control: 'number' },
    bookmarks: { control: 'number' },
    comments: { control: 'number' },
    initialLiked: { control: 'boolean' },
  },
};

export default meta;

export const Default = {
  args: {
    likes: 18,
    bookmarks: 7,
    comments: 5,
  },
};

export const HighEngagement = {
  args: {
    likes: 342,
    bookmarks: 87,
    comments: 42,
  },
};

export const LowEngagement = {
  args: {
    likes: 1,
    bookmarks: 0,
    comments: 0,
  },
};

/** 이미 좋아요한 글은 눌린 상태로 표시된다. */
export const Liked = {
  args: {
    likes: 19,
    bookmarks: 7,
    comments: 5,
    initialLiked: true,
  },
};

/** 좋아요를 누르면 등록 요청이 나가고 수치가 즉시 1 올라간다. */
export const LikeTogglesOn = {
  args: { likes: 18, bookmarks: 7, comments: 5, postId: 10 },
  decorators: [createAuthDecorator()],
  beforeEach: setupLikeRequests({ liked: false, likes: 18 }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const likeButton = await canvas.findByRole('button', { name: '좋아요 하기' });
    await userEvent.click(likeButton);

    await waitFor(() => expect(likeSpy).toHaveBeenCalledWith('/posts/10/likes'));
    await waitFor(() => expect(canvas.getByRole('button', { name: '좋아요 취소하기' })).toBeInTheDocument());
    await waitFor(() => expect(canvas.getByText('19')).toBeInTheDocument());
  },
};

/** 이미 좋아요한 글에서 다시 누르면 해제 요청이 나가고 수치가 1 내려간다. */
export const LikeTogglesOff = {
  args: { likes: 19, bookmarks: 7, comments: 5, postId: 10, initialLiked: true },
  decorators: [createAuthDecorator()],
  beforeEach: setupLikeRequests({ liked: true, likes: 19 }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const likeButton = await canvas.findByRole('button', { name: '좋아요 취소하기' });
    await userEvent.click(likeButton);

    await waitFor(() => expect(unlikeSpy).toHaveBeenCalledWith('/posts/10/likes'));
    await waitFor(() => expect(canvas.getByRole('button', { name: '좋아요 하기' })).toBeInTheDocument());
    await waitFor(() => expect(canvas.getByText('18')).toBeInTheDocument());
  },
};

/** 비로그인 사용자가 누르면 요청 없이 로그인 안내만 보여준다. */
export const RequiresLogin = {
  args: { likes: 18, bookmarks: 7, comments: 5, postId: 10 },
  decorators: [createAuthDecorator({ isLoggedIn: false })],
  beforeEach: setupLikeRequests({ liked: false, likes: 18 }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: '좋아요 하기' }));

    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent('로그인 후 사용할 수 있습니다'));
    expect(likeSpy).not.toHaveBeenCalled();
    expect(canvas.getByText('18')).toBeInTheDocument();
  },
};

/** 요청이 실패하면 낙관적으로 올렸던 수치와 상태를 원래대로 되돌린다. */
export const RollsBackOnFailure = {
  args: { likes: 18, bookmarks: 7, comments: 5, postId: 10 },
  decorators: [createAuthDecorator()],
  beforeEach: setupLikeRequests({ liked: false, likes: 18, failToggle: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: '좋아요 하기' }));

    await waitFor(() => expect(canvas.getByRole('alert')).toBeInTheDocument());
    await waitFor(() => expect(canvas.getByRole('button', { name: '좋아요 하기' })).toBeInTheDocument());
    await waitFor(() => expect(canvas.getByText('18')).toBeInTheDocument());
  },
};

/** 새로고침 직후 SSR 값은 false 지만, 인증된 보정 조회가 끝나면 하트가 채워진다. */
export const RestoresLikedStateAfterReload = {
  args: { likes: 18, bookmarks: 7, comments: 5, postId: 10, initialLiked: false },
  decorators: [createAuthDecorator()],
  beforeEach: setupLikeRequests({ liked: true, likes: 19 }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByRole('button', { name: '좋아요 취소하기' })).toBeInTheDocument());
    await waitFor(() => expect(canvas.getByText('19')).toBeInTheDocument());
  },
};

/** 보정 조회가 끝나기 전에는 버튼이 잠겨, 초기 false 를 기준으로 반대 요청을 보내지 않는다. */
export const BlocksClickBeforeLikeStateResolves = {
  args: { likes: 18, bookmarks: 7, comments: 5, postId: 10, initialLiked: false },
  decorators: [createAuthDecorator()],
  beforeEach: setupSlowLikeStateRequest(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 응답 전: 버튼이 비활성이라 클릭해도 등록 요청이 나가지 않는다.
    const likeButton = canvas.getByRole('button', { name: '좋아요 하기' });
    expect(likeButton).toBeDisabled();
    await userEvent.click(likeButton, { pointerEventsCheck: 0 });
    expect(likeSpy).not.toHaveBeenCalled();

    // 응답 후: 실제 상태(좋아요함)로 바뀌고 다시 누를 수 있다.
    await waitFor(() => expect(canvas.getByRole('button', { name: '좋아요 취소하기' })).toBeEnabled());
  },
};

/** 상태 조회가 실패하면 버튼이 풀리지 않고, 안내와 재시도만 제공한다. */
export const BlocksToggleWhenLikeStateFails = {
  args: { likes: 18, bookmarks: 7, comments: 5, postId: 10, initialLiked: false },
  decorators: [createAuthDecorator()],
  beforeEach: setupFailingLikeStateRequest(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 조회가 끝났지만(실패) 상태를 모르므로 버튼은 잠긴 채로 남아야 한다.
    await waitFor(() => expect(canvas.getByRole('button', { name: '좋아요 하기' })).toBeDisabled());

    await userEvent.click(canvas.getByRole('button', { name: '좋아요 하기' }), { pointerEventsCheck: 0 });
    expect(likeSpy).not.toHaveBeenCalled();

    // 조회 오류는 별도로 안내되고 재시도 수단이 있어야 한다.
    await waitFor(() => expect(canvas.getByRole('button', { name: '다시 시도' })).toBeInTheDocument());
  },
};

/** 좋아요 토글은 목록 캐시만 무효화하고, 댓글 쿼리는 다시 조회하지 않는다. */
export const DoesNotRefetchComments = {
  args: { likes: 18, bookmarks: 7, comments: 5, postId: 10 },
  decorators: [createAuthDecorator()],
  beforeEach: setupLikeRequests({ liked: false, likes: 18 }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const likeButton = await canvas.findByRole('button', { name: '좋아요 하기' });
    await waitFor(() => expect(likeButton).toBeEnabled());

    detailSpy.mockClear();
    await userEvent.click(likeButton);
    await waitFor(() => expect(likeSpy).toHaveBeenCalled());

    // ['posts'] 전체를 무효화하면 댓글 쿼리까지 재조회된다.
    const commentRequests = detailSpy.mock.calls.filter(([url]) => String(url).includes('/comments'));
    expect(commentRequests).toHaveLength(0);
  },
};

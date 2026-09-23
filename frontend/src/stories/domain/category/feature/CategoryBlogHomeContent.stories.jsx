'use client';

import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';

import { apiClient } from '@/lib/api/client';
import CategoryBlogHomeContent from '@/components/domain/category/feature/CategoryBlogHomeContent';

/** @type { import('@storybook/nextjs-vite').Meta<typeof CategoryBlogHomeContent> } */
const meta = {
  title: 'Domain/Category/Feature/CategoryBlogHomeContent',
  component: CategoryBlogHomeContent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    categories: { control: 'object' },
    feed: { control: 'object' },
    profile: { control: 'object' },
    tags: { control: 'object' },
  },
};
export default meta;

const mockCategories = [
  { id: 'all', label: '전체 글', description: '블로그 홈의 전체 게시물을 한 번에 확인합니다.' },
  { id: 'ui-lab', label: 'UI 실험', description: '레이아웃과 컴포넌트 인터랙션을 다듬는 기록입니다.', postIds: [1] },
  { id: 'work-log', label: '작업 로그', description: '작업 과정과 회고를 짧은 메모처럼 남깁니다.', postIds: [2] },
  {
    id: 'design-notes',
    label: '디자인 메모',
    description: '작은 시각적 조정과 레이아웃 메모를 정리합니다.',
    postIds: [1, 3],
  },
];

const mockProfile = {
  name: 'siho',
  bio: '프론트엔드 개발자입니다.',
  avatar: null,
  followers: 128,
  following: 64,
};

const mockPosts = [
  {
    id: 1,
    title: 'Tailwind CSS로 반응형 레이아웃 설계하기',
    excerpt: '다양한 화면 크기에서 일관성 있는 레이아웃을 유지하는 방법을 알아봅니다.',
    date: '2024-05-10',
    author: 'siho',
    likes: 42,
    comments: 5,
    cover: { variant: 'stack', tone: 'blue', size: 'medium', main: 'Layout', caption: 'DESIGN' },
  },
  {
    id: 2,
    title: '인터랙션 디자인 원칙',
    excerpt: '사용자 경험을 극대화하는 인터랙션 패턴을 살펴봅니다.',
    date: '2024-05-08',
    author: 'siho',
    likes: 28,
    comments: 3,
    cover: { variant: 'orbit', tone: 'cyan', size: 'medium', main: 'UX', caption: 'INTERACTION' },
  },
  {
    id: 3,
    title: '주간 회고 #12',
    excerpt: '이번 주에 진행한 작업과 배운 점들을 회고합니다.',
    date: '2024-05-06',
    author: 'siho',
    likes: 15,
    comments: 0,
    cover: { variant: 'minimal', tone: 'cream', size: 'small', main: '#12' },
  },
];

const mockFeed = {
  posts: mockPosts,
};

const mockTags = [
  { id: 'all', label: '전체', active: true },
  { id: 'ui', label: 'UI' },
  { id: 'design', label: '디자인' },
  { id: 'weekly', label: '주간 회고' },
];

export const Default = {
  args: {
    categories: mockCategories,
    feed: mockFeed,
    profile: mockProfile,
    tags: mockTags,
  },
};

// 서버 필터링 검증용 목 데이터.
// 실제 백엔드 카테고리 id 는 숫자 문자열이므로 요청 파라미터 검증 스토리에서는 같은 형태를 쓴다.
const mockServerCategories = [
  { id: 'all', label: '전체 글', description: '블로그 홈의 전체 게시물을 한 번에 확인합니다.' },
  { id: '12', label: 'UI 실험', description: '레이아웃과 컴포넌트 인터랙션을 다듬는 기록입니다.' },
  { id: '13', label: '작업 로그', description: '작업 과정과 회고를 짧은 메모처럼 남깁니다.' },
];

// 태그·카테고리 필터는 블로그 주인의 userId 가 있어야 서버 조회가 동작한다.
const mockOwnerProfile = {
  ...mockProfile,
  userId: 'siho',
  quickActions: [{ id: 'category', label: '카테고리', tone: 'neutral' }],
};

const mockApiPosts = [
  {
    id: 1,
    title: '필터 결과 게시글',
    description: '서버 필터를 통과한 게시글입니다.',
    authorUserId: 'siho',
    authorName: 'siho',
    createdAt: '2024-05-10T09:00:00Z',
  },
];

/** play 함수에서 목록 조회 요청 인자를 확인하기 위해 유지하는 apiClient.get 스파이. */
let postListSpy;

/**
 * 게시글 목록 응답을 고정해 컴포넌트 마운트 시점부터 실제 네트워크 호출을 막는다.
 *
 * @returns {() => void} 스토리 종료 시 스파이를 되돌리는 정리 함수
 */
function setupPostListRequest() {
  postListSpy = spyOn(apiClient, 'get').mockImplementation(async () => ({
    content: mockApiPosts,
    totalElements: 1,
    totalPages: 1,
  }));

  return () => {
    postListSpy.mockRestore();
    postListSpy = undefined;
  };
}

// 뒤처진 요청이 최신 결과를 덮어쓰는지 구분하기 위한 별도 응답.
const staleApiPosts = [
  {
    id: 2,
    title: '뒤처진 요청 게시글',
    description: '이전 필터 요청의 응답입니다.',
    authorUserId: 'siho',
    authorName: 'siho',
    createdAt: '2024-05-09T09:00:00Z',
  },
];

/**
 * UI 태그 요청만 지연시켜 응답 도착 순서를 뒤집는다.
 * 나중에 보낸 전체 태그 요청이 먼저 도착하고, 먼저 보낸 UI 요청이 뒤늦게 도착한다.
 *
 * @returns {() => void} 스토리 종료 시 스파이를 되돌리는 정리 함수
 */
function setupOutOfOrderPostListRequest() {
  postListSpy = spyOn(apiClient, 'get').mockImplementation(async (url, config) => {
    if (config?.params?.tag === 'UI') {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return { content: staleApiPosts, totalElements: 1, totalPages: 1 };
    }

    return { content: mockApiPosts, totalElements: 1, totalPages: 1 };
  });

  return () => {
    postListSpy.mockRestore();
    postListSpy = undefined;
  };
}

/**
 * 마지막 게시글 목록 조회 요청의 쿼리 파라미터를 돌려준다.
 *
 * @returns {object | undefined} 아직 조회 요청이 없으면 undefined
 */
function getLastPostListParams() {
  const postListCalls = postListSpy.mock.calls.filter(([url]) => url === '/posts');

  return postListCalls.at(-1)?.[1]?.params;
}

/** 마운트 직후 실행되는 초기 조회가 끝날 때까지 기다린 뒤 호출 기록을 비운다. */
async function waitForInitialRequest() {
  await waitFor(() => expect(getLastPostListParams()).toBeDefined());
  postListSpy.mockClear();
}

const serverFilterArgs = {
  categories: mockServerCategories,
  feed: mockFeed,
  profile: mockOwnerProfile,
  tags: mockTags,
};

/** 태그를 선택하면 해당 태그 조건으로 서버에서 1페이지를 다시 조회한다. */
export const TagFilterRequest = {
  args: serverFilterArgs,
  beforeEach: setupPostListRequest,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitForInitialRequest();

    await userEvent.click(canvas.getByRole('button', { name: 'UI' }));

    await waitFor(() => {
      const params = getLastPostListParams();

      expect(params).toMatchObject({ page: 0, tag: 'UI', userId: 'siho' });
      // 전체 카테고리는 조건을 보내지 않는다. toMatchObject 만으로는 categoryId 가 실려도 통과한다.
      expect(params).not.toHaveProperty('categoryId');
    });
  },
};

/** 전체 태그로 되돌리면 tag 조건 없이 조회해 모든 게시글을 보여준다. */
export const AllTagFilterRequest = {
  args: serverFilterArgs,
  beforeEach: setupPostListRequest,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitForInitialRequest();

    await userEvent.click(canvas.getByRole('button', { name: 'UI' }));
    await waitFor(() => expect(getLastPostListParams()).toMatchObject({ tag: 'UI' }));

    postListSpy.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: '전체' }));

    await waitFor(() => {
      const params = getLastPostListParams();

      expect(params).toBeDefined();
      expect(params).not.toHaveProperty('tag');
    });
  },
};

/** 필터를 빠르게 바꾸면 뒤처진 이전 요청의 응답이 최신 선택 결과를 덮어쓰지 않는다. */
export const StaleFilterResponseIgnored = {
  args: serverFilterArgs,
  beforeEach: setupOutOfOrderPostListRequest,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitForInitialRequest();

    // UI(지연) 요청을 먼저 보내고 곧바로 전체(즉시) 요청을 보낸다.
    await userEvent.click(canvas.getByRole('button', { name: 'UI' }));
    await userEvent.click(canvas.getByRole('button', { name: '전체' }));

    await waitFor(() => expect(canvas.getByText('필터 결과 게시글')).toBeDefined());

    // 지연된 UI 응답이 도착하고도 남을 시간을 준다.
    await new Promise((resolve) => setTimeout(resolve, 900));

    expect(canvas.getByText('필터 결과 게시글')).toBeDefined();
    expect(canvas.queryByText('뒤처진 요청 게시글')).toBeNull();
  },
};

/** 카테고리와 태그를 함께 선택하면 두 조건이 같은 요청에 실리고 페이지가 1페이지로 초기화된다. */
export const TagWithCategoryFilterRequest = {
  args: serverFilterArgs,
  beforeEach: setupPostListRequest,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 카테고리 선택 모달은 portal 로 body 에 렌더링되어 canvasElement 밖에 있다.
    const body = within(document.body);

    await waitForInitialRequest();

    await userEvent.click(canvas.getByRole('button', { name: '카테고리' }));
    await userEvent.click(await body.findByRole('button', { name: /UI 실험/ }));

    await waitFor(() => expect(getLastPostListParams()).toMatchObject({ categoryId: '12' }));

    postListSpy.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: 'UI' }));

    await waitFor(() => {
      expect(getLastPostListParams()).toMatchObject({ categoryId: '12', page: 0, tag: 'UI' });
    });
  },
};

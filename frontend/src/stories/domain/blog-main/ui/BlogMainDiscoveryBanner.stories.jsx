import { expect, userEvent, within } from 'storybook/test';

import BlogMainDiscoveryBanner from '@/components/domain/blog-main/ui/BlogMainDiscoveryBanner';
import { FALLBACK_DEV_TRENDS } from '@/lib/queries/dev-trends';

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogMainDiscoveryBanner> } */
const meta = {
  title: 'Domain/BlogMain/UI/BlogMainDiscoveryBanner',
  component: BlogMainDiscoveryBanner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-5xl">
        <Story />
      </div>
    ),
  ],
};
export default meta;

const mockPopularImagePosts = [
  {
    id: '101',
    title: 'React 19 Server Actions 실전 도입기',
    authorUserId: 'siho',
    likes: 84,
    cover: {
      variant: 'image',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240"><rect width="400" height="240" fill="%231e293b"/></svg>',
    },
  },
  {
    id: '102',
    title: '지식 그래프 시각화 성능 최적화 가이드',
    authorUserId: 'atlex',
    likes: 62,
    cover: {
      variant: 'image',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240"><rect width="400" height="240" fill="%230f172a"/></svg>',
    },
  },
  {
    id: '103',
    title: 'Spring Boot Virtual Threads 부하 테스트 비교',
    authorUserId: 'devkim',
    likes: 51,
    cover: {
      variant: 'image',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240"><rect width="400" height="240" fill="%231d4ed8"/></svg>',
    },
  },
];

export const Default = {
  args: {
    graphStats: { nodeCount: 18, edgeCount: 34 },
    devTrends: {
      items: FALLBACK_DEV_TRENDS,
      isFallback: true,
      sourceLabel: '추천 기술 이슈',
    },
    popularImagePosts: mockPopularImagePosts,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('link', { name: '지식 그래프 탐색' })).toBeInTheDocument();
    await expect(canvas.getByText('문서 18 · 연결 34')).toBeInTheDocument();
    await expect(canvas.queryByText('Spotlight')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: '다음 배너' }));
    await expect(canvas.getByText('주요 개발 이슈 · 요즘 뜨는 기술')).toBeInTheDocument();
    await expect(canvas.getByText(FALLBACK_DEV_TRENDS[0].title)).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: '다음 배너' }));
    await expect(canvas.getByText('인기 게시글')).toBeInTheDocument();
    await expect(canvas.getByText('React 19 Server Actions 실전 도입기')).toBeInTheDocument();
    await expect(canvas.getByText('지식 그래프 시각화 성능 최적화 가이드')).toBeInTheDocument();
    await expect(canvas.getByText('Spring Boot Virtual Threads 부하 테스트 비교')).toBeInTheDocument();
  },
};

export const EmptyPopularImages = {
  args: {
    graphStats: { nodeCount: 5, edgeCount: 8 },
    devTrends: {
      items: FALLBACK_DEV_TRENDS,
      isFallback: true,
      sourceLabel: '추천 기술 이슈',
    },
    popularImagePosts: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '이전 배너' }));
    await expect(canvas.getByText('대표 이미지가 등록된 인기 게시글을 준비 중입니다')).toBeInTheDocument();
  },
};

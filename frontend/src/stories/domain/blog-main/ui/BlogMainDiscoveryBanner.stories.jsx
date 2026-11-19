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

export const Default = {
  args: {
    graphStats: { nodeCount: 18, edgeCount: 34 },
    devTrends: {
      items: FALLBACK_DEV_TRENDS,
      isFallback: true,
      sourceLabel: '추천 기술 이슈',
    },
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
    await expect(canvas.getByRole('link', { name: '지식 그래프 탐색' })).toBeInTheDocument();
  },
};

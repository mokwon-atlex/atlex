'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';

import PostLinkPopover from '@/components/domain/post-editor/ui/PostLinkPopover';
import { PostLinkExtension } from '@/lib/post-editor/rich-text-post-link-extension';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';

const mockPosts = [
  {
    id: 101,
    title: 'Spring Security와 JWT 기초',
    categoryName: 'Backend',
    authorUserId: 'author1',
    tags: ['Spring', 'JWT'],
  },
  {
    id: 102,
    title: 'Next.js App Router 완벽 가이드',
    categoryName: 'Frontend',
    authorUserId: 'author1',
    tags: ['React', 'Next.js'],
  },
];

function PostLinkDemo({ initialContent = '' }) {
  const editor = useEditor({
    immediatelyRender: false,
    content: initialContent,
    extensions: [
      StarterKit.configure({
        link: {
          autolink: true,
          openOnClick: false,
        },
      }),
      PostLinkExtension,
    ],
  });

  return (
    <div className="w-[500px] rounded-xl border border-border p-4 bg-background space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => editor?.commands.openPostLinkSearch?.()}
          className="px-3 py-1 text-xs rounded-md bg-secondary text-secondary-foreground font-medium"
        >
          내 글 링크 열기
        </button>
      </div>
      <div className="min-h-[120px] rounded-lg border border-border/60 p-3 text-sm focus-within:ring-1 focus-within:ring-primary">
        <EditorContent editor={editor} />
      </div>
      <PostLinkPopover editor={editor} userId="author1" />
    </div>
  );
}

/** @type { import('@storybook/nextjs-vite').Meta } */
const meta = {
  title: 'Domain/PostEditor/UI/PostLinkPopover',
  component: PostLinkDemo,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => {
      useAuthStore.setState({
        isLoggedIn: true,
        user: { userId: 'author1' },
      });
      return <Story />;
    },
  ],
};

export default meta;

export const Default = {
  render: () => <PostLinkDemo initialContent="<p>게시글 링크 테스트 본문입니다.</p>" />,
  play: async ({ canvasElement }) => {
    const getSpy = spyOn(apiClient, 'get').mockImplementation(async (url) => {
      if (url === '/posts') {
        return {
          content: mockPosts,
          totalElements: mockPosts.length,
        };
      }
      return {};
    });

    try {
      const canvas = within(canvasElement);
      const openButton = canvas.getByRole('button', { name: '내 글 링크 열기' });

      // 모달 열기
      await userEvent.click(openButton);

      // 다이얼로그 확인
      const body = within(canvasElement.ownerDocument.body);
      const dialogTitle = await body.findByText('내 게시글 링크 삽입');
      await expect(dialogTitle).toBeVisible();

      // 게시글 항목 확인
      const postItem = await body.findByText('Spring Security와 JWT 기초');
      await expect(postItem).toBeVisible();

      // 게시글 선택하여 링크 삽입
      await userEvent.click(postItem);

      // 모달이 닫혔는지 검증
      await waitFor(() => {
        expect(body.queryByText('내 게시글 링크 삽입')).toBeNull();
      });

      // 에디터에 링크가 삽입되었는지 검증
      const insertedLink = await canvas.findByRole('link', { name: 'Spring Security와 JWT 기초' });
      await expect(insertedLink).toBeVisible();
      await expect(insertedLink).toHaveAttribute('href', '/@author1/101');
    } finally {
      getSpy.mockRestore();
    }
  },
};

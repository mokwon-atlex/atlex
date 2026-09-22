import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';

import { apiClient } from '@/lib/api/client';
import PostEditorPage from '@/components/domain/post-editor/feature/PostEditorPage';
import { postEditorCopy } from '@/data/post-editor/post-editor-copy';

const EXISTING_POST_ID = 42;

const existingPost = {
  id: EXISTING_POST_ID,
  authorUserId: 'john123',
  title: '기존 게시글 제목',
  description: '기존 게시글 설명',
  content: '<p>기존 게시글 본문입니다.</p>',
  categoryId: null,
  isPublic: true,
  tags: ['기존태그'],
};

/** @type { import('@storybook/nextjs-vite').Meta<typeof PostEditorPage> } */
const meta = {
  title: 'Domain/PostEditor/Feature/PostEditorPage',
  component: PostEditorPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;

// 수정 모드: /write/{postId}로 마운트하면 조회된 게시글 값이 폼에 초기화되고,
// 값을 바꿔 제출하면 PATCH /posts/{postId}만 호출되고 POST /posts는 호출되지 않아야 한다.
export const EditModeUpdatesExistingPost = {
  args: {
    postId: EXISTING_POST_ID,
  },
  play: async ({ canvasElement, args }) => {
    const getSpy = spyOn(apiClient, 'get').mockImplementation(async (url) => {
      if (url === `/posts/${EXISTING_POST_ID}`) {
        return existingPost;
      }
      return {};
    });
    const patchSpy = spyOn(apiClient, 'patch').mockResolvedValue({
      ...existingPost,
      id: EXISTING_POST_ID,
    });
    const postSpy = spyOn(apiClient, 'post').mockResolvedValue({});

    try {
      const canvas = within(canvasElement);

      // 조회된 기존 게시글 값이 폼에 반영되는지 확인한다.
      const titleInput = await canvas.findByPlaceholderText(postEditorCopy.titlePlaceholder);
      await waitFor(() => expect(titleInput).toHaveValue(existingPost.title));
      await expect(getSpy).toHaveBeenCalledWith(`/posts/${EXISTING_POST_ID}`);

      // 제목을 수정한 뒤 제출한다.
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, '수정된 게시글 제목');

      const publishButton = canvas.getByRole('button', { name: '수정 완료' });
      await userEvent.click(publishButton);

      // PATCH /posts/{postId}로 변경된 제목이 전달되고, POST /posts는 호출되지 않아야 한다.
      await waitFor(() =>
        expect(patchSpy).toHaveBeenCalledWith(
          `/posts/${EXISTING_POST_ID}`,
          expect.objectContaining({ title: '수정된 게시글 제목' }),
        ),
      );
      await expect(postSpy).not.toHaveBeenCalled();
    } finally {
      getSpy.mockRestore();
      patchSpy.mockRestore();
      postSpy.mockRestore();
    }
  },
};

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

let getSpy;
let patchSpy;
let postSpy;

/**
 * 게시글 조회·수정·작성 API 응답을 고정해 컴포넌트 마운트 시점부터 실제 네트워크 호출을 막는다.
 * play() 안에서 스파이를 걸면 마운트 직후 나가는 조회 요청을 놓쳐 실제 서버로 요청이 전송된다.
 *
 * @returns {() => void} 스토리 종료 시 스파이를 되돌리는 정리 함수
 */
function setupPostRequests() {
  getSpy = spyOn(apiClient, 'get').mockImplementation(async (url) => {
    if (url === `/posts/${EXISTING_POST_ID}`) {
      return existingPost;
    }
    return {};
  });
  patchSpy = spyOn(apiClient, 'patch').mockResolvedValue({
    ...existingPost,
    id: EXISTING_POST_ID,
  });
  postSpy = spyOn(apiClient, 'post').mockResolvedValue({});

  return () => {
    getSpy.mockRestore();
    patchSpy.mockRestore();
    postSpy.mockRestore();
    getSpy = undefined;
    patchSpy = undefined;
    postSpy = undefined;
  };
}

// 수정 모드: /write/{postId}로 마운트하면 조회된 게시글 값이 폼에 초기화되고,
// 값을 바꿔 제출하면 PATCH /posts/{postId}만 호출되고 POST /posts는 호출되지 않아야 한다.
export const EditModeUpdatesExistingPost = {
  args: {
    postId: EXISTING_POST_ID,
  },
  beforeEach: setupPostRequests,
  play: async ({ canvasElement }) => {
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
  },
};

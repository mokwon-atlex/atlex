import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import BlogOptionSkinPicker from '@/components/domain/blog-option/feature/BlogOptionSkinPicker';

/** 선택 상태를 스토리 안에서 유지해 실제 블로그 옵션 화면처럼 동작하게 한다. */
function SkinPickerWithState({ initialSkin = 'DEFAULT', onSave }) {
  const [blogSkin, setBlogSkin] = useState(initialSkin);

  return (
    <BlogOptionSkinPicker
      blogSkin={blogSkin}
      savedBlogSkin={initialSkin}
      onBlogSkinChange={setBlogSkin}
      onSave={() => onSave(blogSkin)}
    />
  );
}

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogOptionSkinPicker> } */
const meta = {
  title: 'Domain/BlogOption/Feature/BlogOptionSkinPicker',
  component: BlogOptionSkinPicker,
  tags: ['autodocs'],
};

export default meta;

/** 스킨을 바꾸면 저장 버튼이 활성화되고, 저장 시 선택한 스킨을 넘긴다. */
export const SelectAndSave = {
  args: { onSave: fn() },
  render: (args) => <SkinPickerWithState onSave={args.onSave} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const saveButton = canvas.getByRole('button', { name: '저장' });

    await expect(canvas.getAllByRole('radio')).toHaveLength(2);
    await expect(canvas.getByRole('radio', { name: /기본/ })).toBeChecked();
    await expect(canvas.getByText('사용 중')).toBeVisible();
    await expect(saveButton).toBeDisabled();

    await userEvent.click(canvas.getByRole('radio', { name: /미니멀/ }));

    await expect(canvas.getByRole('radio', { name: /미니멀/ })).toBeChecked();
    await expect(saveButton).toBeEnabled();

    await userEvent.click(saveButton);
    await expect(args.onSave).toHaveBeenCalledWith('MINIMAL');
  },
};

/** 되돌리기를 누르면 저장된 스킨으로 돌아가고 저장 버튼이 다시 비활성화된다. */
export const Revert = {
  args: { onSave: fn() },
  render: (args) => <SkinPickerWithState initialSkin="MINIMAL" onSave={args.onSave} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('radio', { name: /기본/ }));
    await userEvent.click(canvas.getByRole('button', { name: '되돌리기' }));

    await expect(canvas.getByRole('radio', { name: /미니멀/ })).toBeChecked();
    await expect(canvas.getByRole('button', { name: '저장' })).toBeDisabled();
  },
};

/** 기본 radio 입력이라 방향키로 다음 스킨을 고를 수 있다. */
export const KeyboardArrowSelect = {
  args: { onSave: fn() },
  render: (args) => <SkinPickerWithState onSave={args.onSave} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    canvas.getByRole('radio', { name: '기본' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    await expect(canvas.getByRole('radio', { name: '미니멀' })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: '미니멀' })).toHaveFocus();
  },
};

/** 저장된 스킨을 불러오지 못하면 사용 중 표시 없이 선택과 저장을 막는다. */
export const NotLoaded = {
  args: {
    blogSkin: null,
    savedBlogSkin: null,
    errorMessage: '블로그 옵션 정보를 불러오지 못했습니다.',
    onBlogSkinChange: fn(),
    onSave: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const radio of canvas.getAllByRole('radio')) {
      await expect(radio).toBeDisabled();
      await expect(radio).not.toBeChecked();
    }
    await expect(canvas.queryByText('사용 중')).toBeNull();
    await expect(canvas.getByRole('button', { name: '저장' })).toBeDisabled();
    await expect(canvas.getByRole('alert')).toHaveTextContent('불러오지 못했습니다');
  },
};

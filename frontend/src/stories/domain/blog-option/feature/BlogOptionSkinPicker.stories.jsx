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

    await expect(canvas.getAllByRole('radio')).toHaveLength(3);
    await expect(canvas.getByRole('radio', { name: /기본/ })).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByText('사용 중')).toBeVisible();
    await expect(saveButton).toBeDisabled();

    await userEvent.click(canvas.getByRole('radio', { name: /매거진/ }));

    await expect(canvas.getByRole('radio', { name: /매거진/ })).toHaveAttribute('aria-checked', 'true');
    await expect(saveButton).toBeEnabled();

    await userEvent.click(saveButton);
    await expect(args.onSave).toHaveBeenCalledWith('MAGAZINE');
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

    await expect(canvas.getByRole('radio', { name: /미니멀/ })).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByRole('button', { name: '저장' })).toBeDisabled();
  },
};

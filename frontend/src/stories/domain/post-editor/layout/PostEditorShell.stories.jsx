import PostEditorShell from "@/components/domain/post-editor/layout/PostEditorShell";

/** @type { import('@storybook/nextjs-vite').Meta<typeof PostEditorShell> } */
const meta = {
  title: "Domain/PostEditor/Layout/PostEditorShell",
  component: PostEditorShell,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

export const Default = {
  render: () => (
    <div className="w-[680px] bg-slate-50 p-8">
      <PostEditorShell>
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          에디터 내용이 들어오는 영역
        </div>
      </PostEditorShell>
    </div>
  ),
};

export const WithSections = {
  render: () => (
    <div className="w-[680px] bg-slate-50 p-8">
      <PostEditorShell>
        <div className="border-b border-border px-7 py-4 text-sm font-semibold">TopBar 영역</div>
        <div className="border-b border-border px-7 py-6 text-sm text-muted-foreground">TitleSection 영역</div>
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          CanvasLayout 영역
        </div>
      </PostEditorShell>
    </div>
  ),
};

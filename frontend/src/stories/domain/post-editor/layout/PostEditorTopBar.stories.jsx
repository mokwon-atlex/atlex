import PostEditorTopBar from "@/components/domain/post-editor/layout/PostEditorTopBar";

/** @type { import('@storybook/nextjs-vite').Meta<typeof PostEditorTopBar> } */
const meta = {
  title: "Domain/PostEditor/Layout/PostEditorTopBar",
  component: PostEditorTopBar,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    logoLabel: { control: "text" },
    draftButtonLabel: { control: "text" },
    publishButtonLabel: { control: "text" },
    onOpenDraftModal: { action: "openDraftModal" },
    onPublish: { action: "publish" },
  },
  args: {
    logoLabel: "로고",
    draftButtonLabel: "임시 저장 목록",
    publishButtonLabel: "게시",
  },
};

export default meta;

export const Default = {};

export const InShell = {
  render: () => (
    <div className="overflow-hidden rounded-[26px] border-2 border-foreground bg-background">
      <PostEditorTopBar
        logoLabel="로고"
        draftButtonLabel="임시 저장 목록"
        publishButtonLabel="게시"
        onOpenDraftModal={() => alert("임시 저장 목록 열기")}
        onPublish={() => alert("게시")}
      />
    </div>
  ),
};

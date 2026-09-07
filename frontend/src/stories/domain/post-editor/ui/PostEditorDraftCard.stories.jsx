import PostEditorDraftCard from "@/components/domain/post-editor/ui/PostEditorDraftCard";

const SAMPLE_DRAFT = {
  id: "draft-1",
  title: "벚꽃 축제 운영 일정 안내",
  body: "행사 일정과 부스 배치 변경 사항을 먼저 안내하는 초안입니다. 본문은 50자 이내 요약이 함께 보이도록 가정합니다.",
  updatedAt: "오늘 13:20",
};

/** @type { import('@storybook/nextjs-vite').Meta<typeof PostEditorDraftCard> } */
const meta = {
  title: "Domain/PostEditor/UI/PostEditorDraftCard",
  component: PostEditorDraftCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    loadButtonLabel: { control: "text" },
    deleteButtonLabel: { control: "text" },
  },
  args: {
    draft: SAMPLE_DRAFT,
  },
};

export default meta;

export const Default = {
  render: (args) => (
    <div className="w-[480px]">
      <PostEditorDraftCard {...args} />
    </div>
  ),
};

export const WithHandlers = {
  render: () => (
    <div className="w-[480px]">
      <PostEditorDraftCard
        draft={SAMPLE_DRAFT}
        onLoad={(draft) => alert(`로드: ${draft.title}`)}
        onDelete={(draft) => alert(`삭제: ${draft.title}`)}
      />
    </div>
  ),
};

export const AllDrafts = {
  render: () => (
    <div className="w-[480px] space-y-4">
      {[
        {
          id: "draft-1",
          title: "벚꽃 축제 운영 일정 안내",
          body: "행사 일정과 부스 배치 변경 사항을 먼저 안내하는 초안입니다.",
          updatedAt: "오늘 13:20",
        },
        {
          id: "draft-2",
          title: "4월 서비스 점검 공지",
          body: "점검 시작 시간, 예상 소요 시간, 사용자 영향 범위를 짧게 정리한 임시 저장 글입니다.",
          updatedAt: "오늘 10:05",
        },
        {
          id: "draft-3",
          title: "신규 댓글 기능 미리보기",
          body: "댓글 상단 고정, 멘션, 첨부 기능을 소개하는 소개글 초안입니다.",
          updatedAt: "어제 18:42",
        },
      ].map((draft) => (
        <PostEditorDraftCard key={draft.id} draft={draft} />
      ))}
    </div>
  ),
};

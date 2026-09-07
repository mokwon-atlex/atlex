import { ScrollArea, ScrollBar } from "@/components/common/ui/scroll-area";
import { Separator } from "@/components/common/ui/separator";

const TAGS = [
  "공지", "운영", "이벤트", "채용", "개발", "디자인", "마케팅", "기획",
  "인프라", "보안", "QA", "데이터", "AI", "모바일", "웹", "백엔드",
  "프론트엔드", "DevOps", "분석", "리서치",
];

/** @type { import('@storybook/nextjs-vite').Meta<typeof ScrollArea> } */
const meta = {
  title: "Common/UI/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const Vertical = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">태그 목록</h4>
        {TAGS.map((tag) => (
          <div key={tag}>
            <div className="py-1.5 text-sm">{tag}</div>
            <Separator className="my-1" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Horizontal = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max gap-4 p-4">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="flex h-24 w-32 shrink-0 items-center justify-center rounded-lg border bg-muted text-sm font-medium"
          >
            항목 {i + 1}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

export const LongContent = {
  render: () => (
    <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
      <p className="text-sm leading-6 text-muted-foreground">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i}>
            행사 운영 일정과 부스 배치 변경 사항을 먼저 안내하는 예시 본문입니다.
            현장 동선과 참여 시간, 주의 사항을 확인해 주세요. #{i + 1}
            {" "}
          </span>
        ))}
      </p>
    </ScrollArea>
  ),
};

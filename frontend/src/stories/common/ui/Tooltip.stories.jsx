import { Bold, Info, Settings } from "lucide-react";

import { Button } from "@/components/common/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";

/** @type { import('@storybook/nextjs-vite').Meta<typeof TooltipContent> } */
const meta = {
  title: "Common/UI/Tooltip",
  component: TooltipContent,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    side: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
    },
  },
  args: {
    side: "top",
    align: "center",
  },
  render: (args) => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" />}>
        호버해 보세요
      </TooltipTrigger>
      <TooltipContent {...args}>툴팁 내용</TooltipContent>
    </Tooltip>
  ),
};

export default meta;

export const Default = {
  args: { side: "top" },
};

export const Sides = {
  render: () => (
    <div className="grid grid-cols-3 place-items-center gap-8 p-16">
      <div />
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="sm" />}>위</TooltipTrigger>
        <TooltipContent side="top">top</TooltipContent>
      </Tooltip>
      <div />

      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="sm" />}>왼쪽</TooltipTrigger>
        <TooltipContent side="left">left</TooltipContent>
      </Tooltip>
      <div className="size-6 rounded-full bg-muted" />
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="sm" />}>오른쪽</TooltipTrigger>
        <TooltipContent side="right">right</TooltipContent>
      </Tooltip>

      <div />
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="sm" />}>아래</TooltipTrigger>
        <TooltipContent side="bottom">bottom</TooltipContent>
      </Tooltip>
      <div />
    </div>
  ),
};

export const WithIconButton = {
  render: () => (
    <div className="flex items-center gap-3">
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="icon" />}>
          <Bold className="size-4" />
        </TooltipTrigger>
        <TooltipContent>굵게 (Ctrl+B)</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="icon" />}>
          <Settings className="size-4" />
        </TooltipTrigger>
        <TooltipContent>설정</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<Button variant="ghost" size="icon" />}>
          <Info className="size-4" />
        </TooltipTrigger>
        <TooltipContent side="right">도움말 보기</TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const OnText = {
  render: () => (
    <p className="text-sm text-muted-foreground">
      게시물에{" "}
      <Tooltip>
        <TooltipTrigger className="underline underline-offset-2 cursor-help">
          #태그
        </TooltipTrigger>
        <TooltipContent>본문에 #으로 시작하는 단어를 쓰면 자동 태그가 됩니다.</TooltipContent>
      </Tooltip>
      를 추가하면 검색이 쉬워집니다.
    </p>
  ),
};

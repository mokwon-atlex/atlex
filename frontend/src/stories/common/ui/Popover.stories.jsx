import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/common/ui/popover";
import { Button } from "@/components/common/ui/button";

function BasicPopover({ side, align, sideOffset, alignOffset }) {
  return (
    <div className="flex items-center justify-center h-40">
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>열기</PopoverTrigger>
        <PopoverContent side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset}>
          <PopoverHeader>
            <PopoverTitle>팝오버 제목</PopoverTitle>
            <PopoverDescription>팝오버 내용입니다.</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** @type { import('@storybook/nextjs-vite').Meta } */
const meta = {
  title: "Common/UI/Popover",
  component: PopoverContent,
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
    },
    sideOffset: { control: "number" },
    alignOffset: { control: "number" },
  },
  render: (args) => <BasicPopover {...args} />,
};

export default meta;

export const Default = {
  args: { side: "bottom", align: "center", sideOffset: 4, alignOffset: 0 },
};

export const Positions = {
  render: () => (
    <div className="flex items-center justify-center gap-3 h-60">
      {["top", "bottom", "left", "right"].map((side) => (
        <Popover key={side}>
          <PopoverTrigger render={<Button variant="outline" />}>{side}</PopoverTrigger>
          <PopoverContent side={side}>
            <PopoverHeader>
              <PopoverTitle>Side: {side}</PopoverTitle>
              <PopoverDescription>{side} 방향 팝오버입니다.</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

export const Alignments = {
  render: () => (
    <div className="flex items-center justify-center gap-3 h-40">
      {["start", "center", "end"].map((align) => (
        <Popover key={align}>
          <PopoverTrigger render={<Button variant="outline" />}>{align}</PopoverTrigger>
          <PopoverContent align={align}>
            <PopoverHeader>
              <PopoverTitle>Align: {align}</PopoverTitle>
              <PopoverDescription>{align} 정렬 팝오버입니다.</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

export const WithoutHeader = {
  render: () => (
    <div className="flex items-center justify-center h-40">
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>열기</PopoverTrigger>
        <PopoverContent>
          <p className="text-sm text-muted-foreground">헤더 없이 내용만 있는 팝오버입니다.</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

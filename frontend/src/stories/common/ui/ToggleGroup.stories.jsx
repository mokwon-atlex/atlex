import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from "lucide-react";
import { useState } from "react";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/common/ui/toggle-group";

/** @type { import('@storybook/nextjs-vite').Meta<typeof ToggleGroup> } */
const meta = {
  title: "Common/UI/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    multiple: { control: "boolean" },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
  args: {
    variant: "default",
    size: "default",
    multiple: false,
  },
};

export default meta;

export const SingleSelect = {
  render: () => {
    const [value, setValue] = useState(["left"]);
    return (
      <ToggleGroup value={value} onValueChange={setValue}>
        <ToggleGroupItem value="left" aria-label="왼쪽 정렬">
          <AlignLeft className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="가운데 정렬">
          <AlignCenter className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="오른쪽 정렬">
          <AlignRight className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    );
  },
};

export const MultipleSelect = {
  render: () => {
    const [value, setValue] = useState(["bold"]);
    return (
      <ToggleGroup multiple value={value} onValueChange={setValue}>
        <ToggleGroupItem value="bold" aria-label="굵게">
          <Bold className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="기울임">
          <Italic className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="밑줄">
          <Underline className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    );
  },
};

export const WithText = {
  render: () => {
    const [value, setValue] = useState(["font-style"]);
    return (
      <ToggleGroup value={value} onValueChange={setValue} variant="outline">
        <ToggleGroupItem value="font-style">글꼴 스타일</ToggleGroupItem>
        <ToggleGroupItem value="font-size">글꼴 크기</ToggleGroupItem>
        <ToggleGroupItem value="color">색상</ToggleGroupItem>
        <ToggleGroupItem value="layout">레이아웃</ToggleGroupItem>
      </ToggleGroup>
    );
  },
};

export const Vertical = {
  render: () => {
    const [value, setValue] = useState(["option-1"]);
    return (
      <ToggleGroup
        orientation="vertical"
        value={value}
        onValueChange={setValue}
        variant="outline"
        className="w-36"
      >
        <ToggleGroupItem value="option-1" className="justify-start">옵션 1</ToggleGroupItem>
        <ToggleGroupItem value="option-2" className="justify-start">옵션 2</ToggleGroupItem>
        <ToggleGroupItem value="option-3" className="justify-start">옵션 3</ToggleGroupItem>
      </ToggleGroup>
    );
  },
};

export const Sizes = {
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      {["sm", "default", "lg"].map((size) => (
        <ToggleGroup key={size} size={size} defaultValue={["a"]}>
          <ToggleGroupItem value="a">옵션 A</ToggleGroupItem>
          <ToggleGroupItem value="b">옵션 B</ToggleGroupItem>
          <ToggleGroupItem value="c">옵션 C</ToggleGroupItem>
        </ToggleGroup>
      ))}
    </div>
  ),
};

export const Variants = {
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <ToggleGroup variant="default" defaultValue={["a"]}>
        <ToggleGroupItem value="a">Default A</ToggleGroupItem>
        <ToggleGroupItem value="b">Default B</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup variant="outline" defaultValue={["a"]}>
        <ToggleGroupItem value="a">Outline A</ToggleGroupItem>
        <ToggleGroupItem value="b">Outline B</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const WithDisabledItem = {
  render: () => {
    const [value, setValue] = useState(["a"]);
    return (
      <ToggleGroup value={value} onValueChange={setValue} variant="outline">
        <ToggleGroupItem value="a">활성</ToggleGroupItem>
        <ToggleGroupItem value="b">활성 2</ToggleGroupItem>
        <ToggleGroupItem value="c" disabled>비활성</ToggleGroupItem>
      </ToggleGroup>
    );
  },
};

export const Attached = {
  render: () => {
    const [value, setValue] = useState(["b"]);
    return (
      <ToggleGroup spacing={0} value={value} onValueChange={setValue} variant="outline">
        <ToggleGroupItem value="a">
          <AlignLeft className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="b">
          <AlignCenter className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="c">
          <AlignRight className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    );
  },
};

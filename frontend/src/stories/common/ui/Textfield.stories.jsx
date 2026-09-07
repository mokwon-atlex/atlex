import { Textfield } from "@/components/common/ui/textfield"

/** @type { import('@storybook/nextjs-vite').Meta<typeof Textfield> } */
const meta = {
  title: "Common/UI/Textfield",
  component: Textfield,
  tags: ["autodocs"],

  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "muted",
        "primary",
        "destructive",
      ],
    },

    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg", "xl"],
    },

    weight: {
      control: "select",
      options: [
        "normal",
        "medium",
        "semibold",
        "bold",
      ],
    },

    whitespace: {
      control: "select",
      options: [
        "normal",
        "nowrap",
        "preline",
        "prewrap",
        "keep",
      ],
    },

    children: {
      control: "text",
    },
  },
}

export default meta

export const Default = {
  args: {
    children: "기본 텍스트입니다.",
  },
}

export const Muted = {
  args: {
    variant: "muted",
    children: "Muted Text",
  },
}

export const Bold = {
  args: {
    weight: "bold",
    children: "Bold Text",
  },
}

export const Large = {
  args: {
    size: "xl",
    children: "Large Text",
  },
}

export const PreLine = {
  args: {
    whitespace: "preline",
    children:
      "첫 번째 줄입니다.\n두 번째 줄입니다.\n세 번째 줄입니다.",
  },
}

export const PreWrap = {
  args: {
    whitespace: "prewrap",
    children:
      "줄바꿈과      공백이\n같이 유지됩니다.",
  },
}

export const AllVariants = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Textfield>
        Default Text
      </Textfield>

      <Textfield variant="muted">
        Muted Text
      </Textfield>

      <Textfield variant="primary">
        Primary Text
      </Textfield>

      <Textfield variant="destructive">
        Destructive Text
      </Textfield>

      <Textfield size="xl" weight="bold">
        Large Bold Text
      </Textfield>

      <Textfield whitespace="preline">
        첫 번째 줄
        {"\n"}
        두 번째 줄
      </Textfield>
    </div>
  ),
}
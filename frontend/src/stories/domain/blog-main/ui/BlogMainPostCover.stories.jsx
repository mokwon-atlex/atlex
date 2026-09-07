import BlogMainPostCover from "@/components/domain/blog-main/ui/BlogMainPostCover";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogMainPostCover> } */
const meta = {
  title: "Domain/BlogMain/UI/BlogMainPostCover",
  component: BlogMainPostCover,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    cover: { control: "object" },
  },
  decorators: [
    (Story) => (
      <div className="w-[220px]">
        <Story />
      </div>
    ),
  ],
};
export default meta;

export const Stack = {
  args: {
    cover: { variant: "stack", tone: "blue", size: "medium", main: "Stack", caption: "LAYOUT" },
  },
};

export const Orbit = {
  args: {
    cover: { variant: "orbit", tone: "cyan", size: "medium", main: "Orbit", caption: "MOTION" },
  },
};

export const Poster = {
  args: {
    cover: { variant: "poster", tone: "slate", size: "medium", main: "Poster", caption: "DESIGN", symbol: "P" },
  },
};

export const Wave = {
  args: {
    cover: {
      variant: "wave",
      tone: "ink",
      size: "medium",
      main: "Wave",
      bars: [5, 8, 10, 6, 9, 12, 7, 11, 9, 6],
    },
  },
};

export const Ribbon = {
  args: {
    cover: { variant: "ribbon", tone: "cream", size: "medium", main: "Ribbon" },
  },
};

export const Grid = {
  args: {
    cover: {
      variant: "grid",
      tone: "blue",
      size: "medium",
      caption: "GRID",
      activeCells: [0, 2, 4, 7, 9, 11, 14, 16, 18],
    },
  },
};

export const Thread = {
  args: {
    cover: { variant: "thread", tone: "cyan", size: "medium", main: "Thread", caption: "SERIES" },
  },
};

export const Dots = {
  args: {
    cover: { variant: "dots", tone: "slate", size: "medium", main: "Dots", caption: "PATTERN" },
  },
};

export const Minimal = {
  args: {
    cover: { variant: "minimal", tone: "cream", size: "medium", main: "v1.4.0" },
  },
};

export const NoCover = {
  args: {
    cover: { variant: "none" },
  },
};

export const SizeLarge = {
  args: {
    cover: { variant: "stack", tone: "blue", size: "large", main: "Large Cover", caption: "BIG" },
  },
};

export const SizeSmall = {
  args: {
    cover: { variant: "orbit", tone: "cyan", size: "small", main: "Small", caption: "COMPACT" },
  },
};

import BlogHomeBodyLayout from "@/components/domain/blog-home/layout/BlogHomeBodyLayout";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomeBodyLayout> } */
const meta = {
  title: "Domain/BlogHome/Layout/BlogHomeBodyLayout",
  component: BlogHomeBodyLayout,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    stickySidebar: { control: "boolean" },
    sidebarClassName: { control: "text" },
    contentClassName: { control: "text" },
  },
};

export default meta;

export const Default = {
  render: () => (
    <div className="p-6">
      <BlogHomeBodyLayout
        sidebar={
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            사이드바 영역 (280px)
          </div>
        }
      >
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          메인 콘텐츠 영역 (나머지 너비)
        </div>
      </BlogHomeBodyLayout>
    </div>
  ),
};

export const StickySidebar = {
  render: () => (
    <div className="p-6">
      <BlogHomeBodyLayout
        stickySidebar
        sidebar={
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            스티키 사이드바 — xl 이상에서 top-8 고정
          </div>
        }
      >
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground"
            >
              콘텐츠 카드 {i + 1}
            </div>
          ))}
        </div>
      </BlogHomeBodyLayout>
    </div>
  ),
};

export const NonSticky = {
  render: () => (
    <div className="p-6">
      <BlogHomeBodyLayout
        stickySidebar={false}
        sidebar={
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            비스티키 사이드바
          </div>
        }
      >
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          메인 콘텐츠 영역
        </div>
      </BlogHomeBodyLayout>
    </div>
  ),
};

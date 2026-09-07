import BlogHomeSidebarCard from "@/components/domain/blog-home/layout/BlogHomeSidebarCard";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomeSidebarCard> } */
const meta = {
  title: "Domain/BlogHome/Layout/BlogHomeSidebarCard",
  component: BlogHomeSidebarCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    className: { control: "text" },
    headerClassName: { control: "text" },
    bodyClassName: { control: "text" },
    footerClassName: { control: "text" },
  },
};

export default meta;

export const Default = {
  render: () => (
    <div className="w-72">
      <BlogHomeSidebarCard>
        <p className="text-sm text-muted-foreground">카드 본문 내용입니다.</p>
      </BlogHomeSidebarCard>
    </div>
  ),
};

export const WithHeader = {
  render: () => (
    <div className="w-72">
      <BlogHomeSidebarCard
        header={<p className="text-base font-bold">카드 헤더</p>}
      >
        <p className="text-sm text-muted-foreground">카드 본문 내용입니다.</p>
      </BlogHomeSidebarCard>
    </div>
  ),
};

export const WithFooter = {
  render: () => (
    <div className="w-72">
      <BlogHomeSidebarCard
        footer={
          <button className="text-xs font-semibold text-primary">
            더 보기
          </button>
        }
      >
        <p className="text-sm text-muted-foreground">카드 본문 내용입니다.</p>
      </BlogHomeSidebarCard>
    </div>
  ),
};

export const WithHeaderAndFooter = {
  render: () => (
    <div className="w-72">
      <BlogHomeSidebarCard
        header={<p className="text-base font-bold">카드 헤더</p>}
        footer={
          <button className="text-xs font-semibold text-primary">
            더 보기
          </button>
        }
      >
        <p className="text-sm text-muted-foreground">카드 본문 내용입니다.</p>
      </BlogHomeSidebarCard>
    </div>
  ),
};

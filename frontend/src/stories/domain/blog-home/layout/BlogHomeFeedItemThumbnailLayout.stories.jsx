import BlogHomeFeedItemThumbnailLayout from "@/components/domain/blog-home/layout/BlogHomeFeedItemThumbnailLayout";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomeFeedItemThumbnailLayout> } */
const meta = {
  title: "Domain/BlogHome/Layout/BlogHomeFeedItemThumbnailLayout",
  component: BlogHomeFeedItemThumbnailLayout,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

export const WithImage = {
  render: () => (
    <div className="w-60">
      <BlogHomeFeedItemThumbnailLayout
        thumbnailUrl="https://placehold.co/600x400?text=IMG"
      />
    </div>
  ),
};

export const NoThumbnail = {
  render: () => (
    <div className="w-60 rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
      thumbnailUrl prop이 없으면 렌더링되지 않습니다.
      <BlogHomeFeedItemThumbnailLayout thumbnailUrl={null} />
    </div>
  ),
};

export const Wide = {
  render: () => (
    <div className="w-[600px]">
      <BlogHomeFeedItemThumbnailLayout
        thumbnailUrl="https://placehold.co/600x400?text=IMG"
      />
    </div>
  ),
};

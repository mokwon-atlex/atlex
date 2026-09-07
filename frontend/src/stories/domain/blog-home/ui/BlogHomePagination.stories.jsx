import BlogHomePagination from "@/components/domain/blog-home/ui/BlogHomePagination";

const mockPaginationItems = [
  { id: "page-1", label: "1" },
  { id: "page-2", label: "2", current: true },
  { id: "page-3", label: "3" },
  { id: "page-4", label: "4" },
  { id: "page-5", label: "5" },
];

const mockPaginationItemsLong = [
  { id: "page-1", label: "1" },
  { id: "ellipsis-start", label: "...", kind: "ellipsis" },
  { id: "page-11", label: "11" },
  { id: "page-12", label: "12", current: true },
  { id: "page-13", label: "13" },
  { id: "ellipsis-end", label: "...", kind: "ellipsis" },
  { id: "page-20", label: "20" },
];

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomePagination> } */
const meta = {
  title: "Domain/BlogHome/UI/BlogHomePagination",
  component: BlogHomePagination,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

export const Default = {
  args: {
    items: mockPaginationItems,
  },
};

export const FirstPage = {
  args: {
    items: [
      { id: "page-1", label: "1", current: true },
      { id: "page-2", label: "2" },
      { id: "page-3", label: "3" },
      { id: "page-4", label: "4" },
      { id: "page-5", label: "5" },
    ],
  },
};

export const LastPage = {
  args: {
    items: [
      { id: "page-1", label: "1" },
      { id: "page-2", label: "2" },
      { id: "page-3", label: "3" },
      { id: "page-4", label: "4" },
      { id: "page-5", label: "5", current: true },
    ],
  },
};

export const LongPagination = {
  args: {
    items: mockPaginationItemsLong,
  },
};

export const SinglePage = {
  args: {
    items: [{ id: "page-1", label: "1", current: true }],
  },
};

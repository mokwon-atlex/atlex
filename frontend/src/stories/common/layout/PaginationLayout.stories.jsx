import { useArgs } from "storybook/preview-api";

import PaginationLayout from "@/components/common/layout/PaginationLayout";

/** @type { import('@storybook/nextjs-vite').Meta<typeof PaginationLayout> } */
const meta = {
  title: "Common/Layout/PaginationLayout",
  component: PaginationLayout,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    totalPages: { control: "number" },
    currentPage: { control: "number" },
    siblingCount: { control: "number" },
    showEllipsis: { control: "boolean" },
    showFirstLast: { control: "boolean" },
    onPageChange: { action: "onPageChange" },
  },
  args: {
    totalPages: 10,
    currentPage: 5,
    siblingCount: 1,
    showEllipsis: true,
    showFirstLast: false,
  },
};

export default meta;

export const Playground = {
  render: function Render(args) {
    const [{ currentPage }, updateArgs] = useArgs();

    return (
      <PaginationLayout
        {...args}
        currentPage={currentPage}
        onPageChange={(page) => updateArgs({ currentPage: page })}
      />
    );
  },
};

export const Default = {
  render: function Render() {
    const [{ currentPage }, updateArgs] = useArgs();

    return (
      <PaginationLayout
        totalPages={10}
        currentPage={currentPage ?? 5}
        siblingCount={1}
        showEllipsis={true}
        showFirstLast={false}
        onPageChange={(page) => updateArgs({ currentPage: page })}
      />
    );
  },
};

export const WithFirstLastButtons = {
  render: function Render() {
    const [{ currentPage }, updateArgs] = useArgs();

    return (
      <PaginationLayout
        totalPages={10}
        currentPage={currentPage ?? 5}
        siblingCount={1}
        showEllipsis={true}
        showFirstLast={true}
        onPageChange={(page) => updateArgs({ currentPage: page })}
      />
    );
  },
};

export const WithoutEllipsis = {
  render: function Render() {
    const [{ currentPage }, updateArgs] = useArgs();

    return (
      <PaginationLayout
        totalPages={10}
        currentPage={currentPage ?? 5}
        siblingCount={1}
        showEllipsis={false}
        showFirstLast={false}
        onPageChange={(page) => updateArgs({ currentPage: page })}
      />
    );
  },
};

export const WideSiblingCount = {
  render: function Render() {
    const [{ currentPage }, updateArgs] = useArgs();

    return (
      <PaginationLayout
        totalPages={20}
        currentPage={currentPage ?? 10}
        siblingCount={3}
        showEllipsis={true}
        showFirstLast={true}
        onPageChange={(page) => updateArgs({ currentPage: page })}
      />
    );
  },
};

export const FewPages = {
  render: function Render() {
    const [{ currentPage }, updateArgs] = useArgs();

    return (
      <PaginationLayout
        totalPages={3}
        currentPage={currentPage ?? 1}
        siblingCount={1}
        showEllipsis={true}
        showFirstLast={false}
        onPageChange={(page) => updateArgs({ currentPage: page })}
      />
    );
  },
};

export const SinglePage = {
  render: () => (
    <PaginationLayout
      totalPages={1}
      currentPage={1}
      siblingCount={1}
      showEllipsis={true}
      showFirstLast={false}
      onPageChange={() => {}}
    />
  ),
};

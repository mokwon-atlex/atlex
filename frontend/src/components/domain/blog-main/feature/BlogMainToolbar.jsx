import BlogMainFilterBar from "../ui/BlogMainFilterBar";

export default function BlogMainToolbar({
  activeFilterId,
  filters,
  onChangeFilter,
}) {
  return (
    <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <BlogMainFilterBar
        filters={filters}
        activeFilterId={activeFilterId}
        onChangeFilter={onChangeFilter}
      />
    </section>
  );
}
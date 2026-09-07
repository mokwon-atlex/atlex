'use client';

import CategoryPicker from '@/components/domain/category/feature/CategoryPicker';
import BlogHomeSidebarCategoryDialog from '@/components/domain/blog-home/layout/BlogHomeSidebarCategoryDialog';

export default function CategoryBlogHomeSidebarCategoryDialog({
  actionId = 'category',
  ariaLabel,
  categories = [],
  label,
  onCategorySelect,
  posts = [],
  selectedCategoryId,
}) {
  return (
    <BlogHomeSidebarCategoryDialog
      actionId={actionId}
      ariaLabel={ariaLabel}
      dialogContentClassName="flex h-[80vh] min-h-[32rem] max-h-[80vh] flex-col overflow-hidden rounded-[32px] p-5 sm:max-w-5xl sm:p-6"
      dialogSize="xl"
      label={label}
      showHeader={false}
      renderBody={({ closeDialog }) => (
        <CategoryPicker
          categories={categories}
          posts={posts}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={(categoryId) => {
            onCategorySelect?.(categoryId);
            closeDialog();
          }}
        />
      )}
    />
  );
}

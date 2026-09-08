'use client';

import { useEffect, useRef, useState } from 'react';

import CategoryPickerCard from '@/components/domain/category/ui/CategoryPickerCard';
import { getCategoryPickerItems } from '@/lib/category/category-picker';

const PAGE_SIZE = 6;

export default function CategoryPicker({ categories, posts, selectedCategoryId, onCategorySelect }) {
  const items = getCategoryPickerItems(categories, posts);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollAreaRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [items.length]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    const sentinel = sentinelRef.current;

    if (!scrollArea || !sentinel || visibleCount >= items.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting) {
          return;
        }

        setVisibleCount((currentCount) => Math.min(currentCount + PAGE_SIZE, items.length));
      },
      {
        root: scrollArea,
        rootMargin: '0px 0px 160px 0px',
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [items.length, visibleCount]);

  const visibleItems = items.slice(0, visibleCount);

  return (
    <div ref={scrollAreaRef} className="no-scrollbar h-full min-h-0 overflow-y-auto pr-1">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((category) => (
          <CategoryPickerCard
            key={category.id}
            category={category}
            selected={category.id === selectedCategoryId}
            onSelect={onCategorySelect}
          />
        ))}
      </div>

      {visibleCount < items.length ? <div ref={sentinelRef} className="h-1" aria-hidden /> : null}
    </div>
  );
}

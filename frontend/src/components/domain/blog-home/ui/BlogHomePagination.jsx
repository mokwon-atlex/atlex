'use client';

import { useEffect, useState } from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/common/ui/pagination';
import { cn } from '@/lib/utils';

function getNumericPages(items = []) {
  return items.map((item) => Number.parseInt(item.label, 10)).filter((page) => Number.isFinite(page));
}

function getPageRange(currentPage, totalPages, siblingCount = 1) {
  const left = Math.max(1, currentPage - siblingCount);
  const right = Math.min(totalPages, currentPage + siblingCount);
  const pages = [];

  if (left > 1) {
    pages.push(1);
    if (left > 2) {
      pages.push('ellipsis-left');
    }
  }

  for (let page = left; page <= right; page += 1) {
    pages.push(page);
  }

  if (right < totalPages) {
    if (right < totalPages - 1) {
      pages.push('ellipsis-right');
    }
    pages.push(totalPages);
  }

  return pages;
}

export default function BlogHomePagination({
  currentPage: controlledCurrentPage,
  isLoading = false,
  items = [],
  onPageChange,
  totalPages: controlledTotalPages,
}) {
  const numericPages = getNumericPages(items);
  const totalPages = Math.max(controlledTotalPages ?? Math.max(...numericPages, 1), 1);
  const initialCurrentPage = Number.parseInt(items.find((item) => item.current)?.label, 10) || 1;
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const resolvedCurrentPage = controlledCurrentPage ?? currentPage;
  const pages = getPageRange(resolvedCurrentPage, totalPages, 1);
  const isPrevDisabled = isLoading || resolvedCurrentPage <= 1;
  const isNextDisabled = isLoading || resolvedCurrentPage >= totalPages;

  useEffect(() => {
    setCurrentPage(initialCurrentPage);
  }, [initialCurrentPage]);

  function handlePageChange(page, event) {
    event.preventDefault();

    if (isLoading || page < 1 || page > totalPages || page === resolvedCurrentPage) {
      return;
    }

    if (onPageChange) {
      onPageChange(page);
    } else {
      setCurrentPage(page);
    }
  }

  return (
    <Pagination className="pt-2">
      <PaginationContent className="flex-wrap gap-2">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            text=""
            onClick={(event) => handlePageChange(resolvedCurrentPage - 1, event)}
            aria-disabled={isPrevDisabled}
            disabled={isPrevDisabled}
            className={cn(
              'h-10 min-w-10 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-muted-foreground shadow-none transition-colors hover:no-underline',
              isPrevDisabled && 'pointer-events-none opacity-50',
            )}
          />
        </PaginationItem>

        {pages.map((page) => {
          if (page === 'ellipsis-left' || page === 'ellipsis-right') {
            return (
              <PaginationItem key={page}>
                <PaginationEllipsis className="h-10 min-w-10 px-2 text-muted-foreground" />
              </PaginationItem>
            );
          }

          const isActive = page === resolvedCurrentPage;

          return (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={isActive}
                onClick={(event) => handlePageChange(page, event)}
                disabled={isActive}
                className={cn(
                  'h-10 min-w-10 rounded-lg border px-3 text-sm font-semibold shadow-none transition-colors hover:no-underline',
                  isActive
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-card text-muted-foreground',
                )}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            text=""
            onClick={(event) => handlePageChange(resolvedCurrentPage + 1, event)}
            aria-disabled={isNextDisabled}
            disabled={isNextDisabled}
            className={cn(
              'h-10 min-w-10 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-muted-foreground shadow-none transition-colors hover:no-underline',
              isNextDisabled && 'pointer-events-none opacity-50',
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

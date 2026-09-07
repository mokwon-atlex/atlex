"use client"

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/common/ui/pagination";

function getPageRange(currentPage, totalPages, siblingCount) {
    const left = Math.max(1, currentPage - siblingCount);
    const right = Math.min(totalPages, currentPage + siblingCount);
    const items = [];

    if (left > 1) {
        items.push(1);
        if (left > 2) items.push("ellipsis-left");
    }

    for (let i = left; i <= right; i++) {
        items.push(i);
    }

    if (right < totalPages) {
        if (right < totalPages - 1) items.push("ellipsis-right");
        items.push(totalPages);
    }

    return items;
}

/**
 * @param {number} totalPages 전체 페이지 수
 * @param {number} currentPage 현재 페이지 (1-based)
 * @param {(page: number) => void} onPageChange 페이지 변경 콜백
 * @param {number} [siblingCount=1] 현재 페이지 양옆에 보여줄 페이지 수
 * @param {boolean} [showEllipsis=true] 생략 부호(...) 표시 여부
 * @param {boolean} [showFirstLast=false] 첫/마지막 페이지 버튼 표시 여부
 */
export default function PaginationLayout({
    totalPages,
    currentPage,
    onPageChange,
    siblingCount = 1,
    showEllipsis = true,
    showFirstLast = false,
}) {
    const isPrevDisabled = currentPage <= 1;
    const isNextDisabled = currentPage >= totalPages;
    const pages = getPageRange(currentPage, totalPages, siblingCount);

    const handlePage = (page, e) => {
        e.preventDefault();
        if (page < 1 || page > totalPages) return;
        onPageChange(page);
    };

    const disabledClass = "pointer-events-none opacity-50";

    return (
        <Pagination>
            <PaginationContent>
                {showFirstLast && (
                    <PaginationItem>
                        <PaginationLink
                            href="#"
                            onClick={(e) => handlePage(1, e)}
                            aria-disabled={isPrevDisabled}
                            className={isPrevDisabled ? disabledClass : ""}
                            disabled={isPrevDisabled}
                            aria-label="첫 페이지로 이동"
                        >
                            «
                        </PaginationLink>
                    </PaginationItem>
                )}
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => handlePage(currentPage - 1, e)}
                        aria-disabled={isPrevDisabled}
                        className={isPrevDisabled ? disabledClass : ""}
                        disabled={isPrevDisabled}
                        aria-label="이전 페이지로 이동"
                    />
                </PaginationItem>

                {pages.map((item) => {
                    if (item === "ellipsis-left" || item === "ellipsis-right") {
                        if (!showEllipsis) return null;
                        return (
                            <PaginationItem key={item}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        );
                    }
                    return (
                        <PaginationItem key={item}>
                            <PaginationLink
                                href="#"
                                isActive={item === currentPage}
                                onClick={(e) => handlePage(item, e)}
                                disabled={item === currentPage}
                                aria-label={`${item} 페이지로 이동`}
                            >
                                {item}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => handlePage(currentPage + 1, e)}
                        aria-disabled={isNextDisabled}
                        className={isNextDisabled ? disabledClass : ""}
                        disabled={isNextDisabled}
                        aria-label="다음 페이지로 이동"
                    />
                </PaginationItem>
                {showFirstLast && (
                    <PaginationItem>
                        <PaginationLink
                            href="#"
                            onClick={(e) => handlePage(totalPages, e)}
                            aria-disabled={isNextDisabled}
                            className={isNextDisabled ? disabledClass : ""}
                            disabled={isNextDisabled}
                            aria-label="마지막 페이지로 이동"
                        >
                            »
                        </PaginationLink>
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
}

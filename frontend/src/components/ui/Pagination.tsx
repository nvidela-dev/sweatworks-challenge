import { useState } from 'react';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  // Always show first page
  pages.push(1);

  if (currentPage <= 3) {
    // Near the start: 1 2 3 4 5 ... last
    pages.push(2, 3, 4, 5, 'ellipsis', totalPages);
  } else if (currentPage >= totalPages - 2) {
    // Near the end: 1 ... last-4 last-3 last-2 last-1 last
    pages.push('ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    // Middle: 1 ... current-1 current current+1 ... last
    pages.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
  }

  return pages;
}

export function Pagination({
  page,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  hasNext,
  hasPrev,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState('');

  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);
  const pageNumbers = getPageNumbers(page, totalPages);

  const handleJump = () => {
    const pageNum = parseInt(jumpValue, 10);
    if (pageNum >= 1 && pageNum <= totalPages && pageNum !== page) {
      onPageChange(pageNum);
      setJumpValue('');
    }
  };

  const handleJumpKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJump();
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mt-4 py-3">
      {/* Results info */}
      <div className="text-sm text-gray-600">
        Showing {startItem}-{endItem} of {totalCount} results
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-2">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-sm text-gray-600">
            Rows per page:
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Previous button */}
        <Button variant="secondary" size="sm" disabled={!hasPrev} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>

        {/* Page number buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, index) =>
            pageNum === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                disabled={pageNum === page}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  pageNum === page
                    ? 'bg-blue-600 text-white cursor-default'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            )
          )}
        </div>

        {/* Next button */}
        <Button variant="secondary" size="sm" disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>

        {/* Jump to page */}
        <div className="flex items-center gap-1 ml-2">
          <label htmlFor="jump-to-page" className="text-sm text-gray-600">
            Go to:
          </label>
          <input
            id="jump-to-page"
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={handleJumpKeyDown}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={String(page)}
          />
          <Button variant="secondary" size="sm" onClick={handleJump}>
            Go
          </Button>
        </div>
      </div>
    </div>
  );
}

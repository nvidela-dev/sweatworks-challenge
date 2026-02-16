import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function Pagination({ page, totalPages, onPageChange, hasNext, hasPrev }: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <Button variant="secondary" size="sm" disabled={!hasPrev} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <span className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>
      <Button variant="secondary" size="sm" disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
        Next
      </Button>
    </div>
  );
}

import { Button } from './Button';
import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function Pagination({ page, totalPages, onPageChange, hasNext, hasPrev }: PaginationProps) {
  return (
    <div className={styles.container}>
      <Button variant="secondary" size="sm" disabled={!hasPrev} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <span className={styles.info}>
        Page {page} of {totalPages}
      </span>
      <Button variant="secondary" size="sm" disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
        Next
      </Button>
    </div>
  );
}

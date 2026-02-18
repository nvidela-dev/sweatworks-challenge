import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  const defaultProps = {
    page: 2,
    totalPages: 5,
    pageSize: 10,
    totalCount: 50,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    hasNext: true,
    hasPrev: true,
  };

  describe('results info', () => {
    it('renders correct results info', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByText('Showing 11-20 of 50 results')).toBeInTheDocument();
    });

    it('renders correct results info on first page', () => {
      render(<Pagination {...defaultProps} page={1} />);
      expect(screen.getByText('Showing 1-10 of 50 results')).toBeInTheDocument();
    });

    it('renders correct results info on last page with partial results', () => {
      render(<Pagination {...defaultProps} page={5} totalCount={45} />);
      expect(screen.getByText('Showing 41-45 of 45 results')).toBeInTheDocument();
    });
  });

  describe('page navigation buttons', () => {
    it('renders Previous and Next buttons', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    });

    it('disables Previous button when hasPrev is false', () => {
      render(<Pagination {...defaultProps} hasPrev={false} />);
      expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    });

    it('disables Next button when hasNext is false', () => {
      render(<Pagination {...defaultProps} hasNext={false} />);
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    });

    it('calls onPageChange with previous page when Previous is clicked', async () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

      await userEvent.click(screen.getByRole('button', { name: 'Previous' }));

      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('calls onPageChange with next page when Next is clicked', async () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      expect(onPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe('page number buttons', () => {
    it('renders page number buttons for small page count', () => {
      render(<Pagination {...defaultProps} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
    });

    it('highlights current page button', () => {
      render(<Pagination {...defaultProps} page={3} />);

      const currentPageButton = screen.getByRole('button', { name: '3' });
      expect(currentPageButton).toBeDisabled();
      expect(currentPageButton).toHaveClass('bg-blue-600');
    });

    it('calls onPageChange when page number is clicked', async () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

      await userEvent.click(screen.getByRole('button', { name: '4' }));

      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('shows ellipsis for many pages when near start', () => {
      render(<Pagination {...defaultProps} page={2} totalPages={20} totalCount={200} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();
    });

    it('shows ellipsis for many pages when in middle', () => {
      render(<Pagination {...defaultProps} page={10} totalPages={20} totalCount={200} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '9' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '11' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
      expect(screen.getAllByText('...')).toHaveLength(2);
    });
  });

  describe('page size selector', () => {
    it('renders page size selector with options', () => {
      render(<Pagination {...defaultProps} />);

      const select = screen.getByLabelText('Rows per page:');
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue('10');
    });

    it('calls onPageSizeChange when page size is changed', async () => {
      const onPageSizeChange = vi.fn();
      render(<Pagination {...defaultProps} onPageSizeChange={onPageSizeChange} />);

      const select = screen.getByLabelText('Rows per page:');
      await userEvent.selectOptions(select, '25');

      expect(onPageSizeChange).toHaveBeenCalledWith(25);
    });

    it('renders all page size options', () => {
      render(<Pagination {...defaultProps} />);

      const select = screen.getByLabelText('Rows per page:');
      expect(select).toContainHTML('<option value="10">10</option>');
      expect(select).toContainHTML('<option value="25">25</option>');
      expect(select).toContainHTML('<option value="50">50</option>');
      expect(select).toContainHTML('<option value="100">100</option>');
    });
  });

  describe('jump to page', () => {
    it('renders jump to page input', () => {
      render(<Pagination {...defaultProps} />);

      expect(screen.getByLabelText('Go to:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
    });

    it('calls onPageChange when valid page is entered and Go is clicked', async () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

      const input = screen.getByLabelText('Go to:');
      await userEvent.type(input, '4');
      await userEvent.click(screen.getByRole('button', { name: 'Go' }));

      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('calls onPageChange when Enter is pressed in input', async () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

      const input = screen.getByLabelText('Go to:');
      await userEvent.type(input, '3{Enter}');

      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('does not call onPageChange for invalid page number', async () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

      const input = screen.getByLabelText('Go to:');
      await userEvent.type(input, '10');
      await userEvent.click(screen.getByRole('button', { name: 'Go' }));

      expect(onPageChange).not.toHaveBeenCalled();
    });

    it('does not call onPageChange when jumping to current page', async () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} page={2} onPageChange={onPageChange} />);

      const input = screen.getByLabelText('Go to:');
      await userEvent.type(input, '2');
      await userEvent.click(screen.getByRole('button', { name: 'Go' }));

      expect(onPageChange).not.toHaveBeenCalled();
    });

    it('clears input after successful jump', async () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

      const input = screen.getByLabelText('Go to:');
      await userEvent.type(input, '4');
      await userEvent.click(screen.getByRole('button', { name: 'Go' }));

      expect(input).toHaveValue(null);
    });
  });

  describe('edge cases', () => {
    it('renders correctly on first page', () => {
      render(<Pagination {...defaultProps} page={1} hasPrev={false} />);

      expect(screen.getByText('Showing 1-10 of 50 results')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    });

    it('renders correctly on last page', () => {
      render(<Pagination {...defaultProps} page={5} hasNext={false} />);

      expect(screen.getByText('Showing 41-50 of 50 results')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    });

    it('renders correctly with single page', () => {
      render(
        <Pagination
          page={1}
          totalPages={1}
          pageSize={10}
          totalCount={5}
          onPageChange={vi.fn()}
          onPageSizeChange={vi.fn()}
          hasNext={false}
          hasPrev={false}
        />
      );

      expect(screen.getByText('Showing 1-5 of 5 results')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  const defaultProps = {
    page: 2,
    totalPages: 5,
    onPageChange: vi.fn(),
    hasNext: true,
    hasPrev: true,
  };

  it('renders current page and total pages', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

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

  it('renders correctly on first page', () => {
    render(<Pagination {...defaultProps} page={1} hasPrev={false} />);

    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('renders correctly on last page', () => {
    render(<Pagination {...defaultProps} page={5} hasNext={false} />);

    expect(screen.getByText('Page 5 of 5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('renders correctly with single page', () => {
    render(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} hasNext={false} hasPrev={false} />);

    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});

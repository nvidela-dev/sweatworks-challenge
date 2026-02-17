import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemberSearch } from './MemberSearch';

describe('MemberSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders search input and button', () => {
    render(<MemberSearch onSearch={vi.fn()} />);

    expect(screen.getByPlaceholderText('Search by name or email...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('shows initial value', () => {
    render(<MemberSearch onSearch={vi.fn()} initialValue="john" />);

    expect(screen.getByDisplayValue('john')).toBeInTheDocument();
  });

  it('calls onSearch on form submit', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const handleSearch = vi.fn();
    render(<MemberSearch onSearch={handleSearch} />);

    const input = screen.getByPlaceholderText('Search by name or email...');
    await user.type(input, 'john');

    const button = screen.getByRole('button', { name: 'Search' });
    await user.click(button);

    expect(handleSearch).toHaveBeenCalledWith('john');
  });

  it('debounces search on input change', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const handleSearch = vi.fn();
    render(<MemberSearch onSearch={handleSearch} debounceMs={300} />);

    const input = screen.getByPlaceholderText('Search by name or email...');
    await user.type(input, 'j');

    // Should not call immediately
    expect(handleSearch).not.toHaveBeenCalled();

    // Advance timers past debounce
    vi.advanceTimersByTime(300);

    expect(handleSearch).toHaveBeenCalledWith('j');
  });

  it('does not call onSearch on initial mount', () => {
    const handleSearch = vi.fn();
    render(<MemberSearch onSearch={handleSearch} initialValue="" />);

    vi.advanceTimersByTime(500);

    expect(handleSearch).not.toHaveBeenCalled();
  });
});

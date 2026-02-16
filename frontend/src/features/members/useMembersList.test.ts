import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useMembersList } from './useMembersList';
import * as api from '@/api';

vi.mock('@/api', () => ({
  getMembers: vi.fn(),
}));

describe('useMembersList', () => {
  const mockMembers = [
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: null, isDeleted: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: null, isDeleted: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  ];

  const mockMeta = {
    page: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches members on mount', async () => {
    vi.mocked(api.getMembers).mockResolvedValueOnce({ data: mockMembers, meta: mockMeta });

    const { result } = renderHook(() => useMembersList({ page: 1 }));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.members).toEqual(mockMembers);
    expect(result.current.meta).toEqual(mockMeta);
    expect(result.current.error).toBeNull();
    expect(api.getMembers).toHaveBeenCalledWith({ page: 1, pageSize: undefined, search: undefined });
  });

  it('passes params to API', async () => {
    vi.mocked(api.getMembers).mockResolvedValueOnce({ data: mockMembers, meta: mockMeta });

    renderHook(() => useMembersList({ page: 2, pageSize: 20, search: 'john' }));

    await waitFor(() => {
      expect(api.getMembers).toHaveBeenCalledWith({ page: 2, pageSize: 20, search: 'john' });
    });
  });

  it('refetches when params change', async () => {
    vi.mocked(api.getMembers).mockResolvedValue({ data: mockMembers, meta: mockMeta });

    const { rerender } = renderHook(({ page }) => useMembersList({ page }), {
      initialProps: { page: 1 },
    });

    await waitFor(() => {
      expect(api.getMembers).toHaveBeenCalledTimes(1);
    });

    rerender({ page: 2 });

    await waitFor(() => {
      expect(api.getMembers).toHaveBeenCalledTimes(2);
    });
  });

  it('handles error', async () => {
    vi.mocked(api.getMembers).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useMembersList({ page: 1 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.members).toEqual([]);
  });

  it('handles non-Error rejection', async () => {
    vi.mocked(api.getMembers).mockRejectedValueOnce('Unknown error');

    const { result } = renderHook(() => useMembersList({ page: 1 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch members');
  });

  it('refetch function triggers new fetch', async () => {
    vi.mocked(api.getMembers).mockResolvedValue({ data: mockMembers, meta: mockMeta });

    const { result } = renderHook(() => useMembersList({ page: 1 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.getMembers).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(api.getMembers).toHaveBeenCalledTimes(2);
    });
  });

  it('returns initial state', () => {
    vi.mocked(api.getMembers).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useMembersList({ page: 1 }));

    expect(result.current.loading).toBe(true);
    expect(result.current.members).toEqual([]);
    expect(result.current.meta).toBeNull();
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refetch).toBe('function');
  });
});

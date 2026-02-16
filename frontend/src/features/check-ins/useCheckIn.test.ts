import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCheckIn } from './useCheckIn';
import * as api from '@/api';

vi.mock('@/api', () => ({
  createCheckIn: vi.fn(),
  ApiError: class ApiError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
      this.name = 'ApiError';
    }
  },
}));

describe('useCheckIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useCheckIn());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.checkIn).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('handles successful check-in', async () => {
    const mockCheckIn = { id: '1', memberId: 'member-1', membershipId: 'membership-1', checkedInAt: new Date().toISOString() };
    vi.mocked(api.createCheckIn).mockResolvedValueOnce(mockCheckIn);

    const { result } = renderHook(() => useCheckIn());

    let checkInResult: unknown;
    await act(async () => {
      checkInResult = await result.current.checkIn('member-1');
    });

    expect(checkInResult).toEqual(mockCheckIn);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(api.createCheckIn).toHaveBeenCalledWith('member-1');
  });

  it('sets loading state during check-in', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(api.createCheckIn).mockReturnValueOnce(pendingPromise as Promise<never>);

    const { result } = renderHook(() => useCheckIn());

    act(() => {
      result.current.checkIn('member-1');
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise!({ id: '1' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles API error', async () => {
    const apiError = new api.ApiError('NO_ACTIVE_MEMBERSHIP', 'Member has no active membership', 400);
    vi.mocked(api.createCheckIn).mockRejectedValueOnce(apiError);

    const { result } = renderHook(() => useCheckIn());

    let checkInResult: unknown;
    await act(async () => {
      checkInResult = await result.current.checkIn('member-1');
    });

    expect(checkInResult).toBeNull();
    expect(result.current.error).toBe('Member has no active membership');
    expect(result.current.loading).toBe(false);
  });

  it('handles generic error', async () => {
    vi.mocked(api.createCheckIn).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useCheckIn());

    await act(async () => {
      await result.current.checkIn('member-1');
    });

    expect(result.current.error).toBe('Network error');
  });

  it('resets error state', async () => {
    vi.mocked(api.createCheckIn).mockRejectedValueOnce(new Error('Error'));

    const { result } = renderHook(() => useCheckIn());

    await act(async () => {
      await result.current.checkIn('member-1');
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
  });
});

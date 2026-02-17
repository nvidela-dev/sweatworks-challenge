import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '@/api';
import { useMemberProfile } from './useMemberProfile';

vi.mock('@/api', () => ({
  getMemberProfile: vi.fn(),
}));

describe('useMemberProfile', () => {
  const mockProfile = {
    member: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-0123',
      isDeleted: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    activeMembership: {
      id: 'mem-1',
      memberId: '1',
      planId: 'plan-1',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      cancelledAt: null,
      status: 'active' as const,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      plan: {
        id: 'plan-1',
        name: 'Premium',
        description: 'Premium membership plan',
        priceCents: 9999,
        durationDays: 30,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    },
    lastCheckIn: '2024-01-15T10:00:00Z',
    checkInsLast30Days: 12,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches profile on mount', async () => {
    vi.mocked(api.getMemberProfile).mockResolvedValueOnce(mockProfile);

    const { result } = renderHook(() => useMemberProfile('1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.error).toBeNull();
    expect(api.getMemberProfile).toHaveBeenCalledWith('1');
  });

  it('handles empty memberId', async () => {
    const { result } = renderHook(() => useMemberProfile(''));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toBeNull();
    expect(api.getMemberProfile).not.toHaveBeenCalled();
  });

  it('refetches when memberId changes', async () => {
    const profile1 = { ...mockProfile, member: { ...mockProfile.member, id: '1' } };
    const profile2 = { ...mockProfile, member: { ...mockProfile.member, id: '2', firstName: 'Jane' } };

    vi.mocked(api.getMemberProfile)
      .mockResolvedValueOnce(profile1)
      .mockResolvedValueOnce(profile2);

    const { result, rerender } = renderHook(({ id }) => useMemberProfile(id), {
      initialProps: { id: '1' },
    });

    await waitFor(() => {
      expect(result.current.profile).toEqual(profile1);
    });

    rerender({ id: '2' });

    await waitFor(() => {
      expect(result.current.profile).toEqual(profile2);
    });

    expect(api.getMemberProfile).toHaveBeenCalledTimes(2);
  });

  it('handles error', async () => {
    vi.mocked(api.getMemberProfile).mockRejectedValueOnce(new Error('Member not found'));

    const { result } = renderHook(() => useMemberProfile('invalid-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Member not found');
    expect(result.current.profile).toBeNull();
  });

  it('handles non-Error rejection', async () => {
    vi.mocked(api.getMemberProfile).mockRejectedValueOnce('Unknown error');

    const { result } = renderHook(() => useMemberProfile('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch member profile');
  });

  it('refetch function triggers new fetch', async () => {
    vi.mocked(api.getMemberProfile).mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useMemberProfile('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.getMemberProfile).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(api.getMemberProfile).toHaveBeenCalledTimes(2);
    });
  });

  it('returns initial state', () => {
    vi.mocked(api.getMemberProfile).mockImplementation(() => new Promise(() => { /* never resolves */ }));

    const { result } = renderHook(() => useMemberProfile('1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('clears error on successful refetch', async () => {
    vi.mocked(api.getMemberProfile)
      .mockRejectedValueOnce(new Error('Error'))
      .mockResolvedValueOnce(mockProfile);

    const { result } = renderHook(() => useMemberProfile('1'));

    await waitFor(() => {
      expect(result.current.error).toBe('Error');
    });

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.profile).toEqual(mockProfile);
    });
  });
});

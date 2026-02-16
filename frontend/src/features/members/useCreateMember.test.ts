import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCreateMember } from './useCreateMember';
import * as api from '@/api';

vi.mock('@/api', () => ({
  createMember: vi.fn(),
  ApiError: class ApiError extends Error {
    code: string;
    statusCode: number;
    details?: { field: string; message: string; code: string }[];
    constructor(
      code: string,
      message: string,
      statusCode: number,
      details?: { field: string; message: string; code: string }[]
    ) {
      super(message);
      this.code = code;
      this.statusCode = statusCode;
      this.details = details;
      this.name = 'ApiError';
    }
  },
}));

describe('useCreateMember', () => {
  const mockInput = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  const mockMember = {
    id: '1',
    ...mockInput,
    phone: null,
    isDeleted: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useCreateMember());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.fieldErrors).toEqual({});
    expect(typeof result.current.createMember).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('creates member successfully', async () => {
    vi.mocked(api.createMember).mockResolvedValueOnce(mockMember);

    const { result } = renderHook(() => useCreateMember());

    let createdMember: unknown;
    await act(async () => {
      createdMember = await result.current.createMember(mockInput);
    });

    expect(createdMember).toEqual(mockMember);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(api.createMember).toHaveBeenCalledWith(mockInput);
  });

  it('sets loading state during creation', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(api.createMember).mockReturnValueOnce(pendingPromise as Promise<never>);

    const { result } = renderHook(() => useCreateMember());

    act(() => {
      result.current.createMember(mockInput);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise!(mockMember);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles API error with message', async () => {
    const apiError = new api.ApiError('VALIDATION_ERROR', 'Email already exists', 400);
    vi.mocked(api.createMember).mockRejectedValueOnce(apiError);

    const { result } = renderHook(() => useCreateMember());

    let createdMember: unknown;
    await act(async () => {
      createdMember = await result.current.createMember(mockInput);
    });

    expect(createdMember).toBeNull();
    expect(result.current.error).toBe('Email already exists');
    expect(result.current.loading).toBe(false);
  });

  it('handles API error with field details', async () => {
    const apiError = new api.ApiError('VALIDATION_ERROR', 'Validation failed', 400, [
      { field: 'email', message: 'Invalid email format', code: 'invalid_format' },
      { field: 'firstName', message: 'Required', code: 'required' },
    ]);
    vi.mocked(api.createMember).mockRejectedValueOnce(apiError);

    const { result } = renderHook(() => useCreateMember());

    await act(async () => {
      await result.current.createMember(mockInput);
    });

    expect(result.current.fieldErrors).toEqual({
      email: 'Invalid email format',
      firstName: 'Required',
    });
  });

  it('handles generic error', async () => {
    vi.mocked(api.createMember).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useCreateMember());

    await act(async () => {
      await result.current.createMember(mockInput);
    });

    expect(result.current.error).toBe('Network error');
  });

  it('handles non-Error rejection', async () => {
    vi.mocked(api.createMember).mockRejectedValueOnce('Unknown error');

    const { result } = renderHook(() => useCreateMember());

    await act(async () => {
      await result.current.createMember(mockInput);
    });

    expect(result.current.error).toBe('Failed to create member');
  });

  it('reset clears error state', async () => {
    vi.mocked(api.createMember).mockRejectedValueOnce(new Error('Error'));

    const { result } = renderHook(() => useCreateMember());

    await act(async () => {
      await result.current.createMember(mockInput);
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.fieldErrors).toEqual({});
  });

  it('clears previous errors on new create attempt', async () => {
    vi.mocked(api.createMember).mockRejectedValueOnce(new Error('First error'));

    const { result } = renderHook(() => useCreateMember());

    await act(async () => {
      await result.current.createMember(mockInput);
    });

    expect(result.current.error).toBe('First error');

    vi.mocked(api.createMember).mockResolvedValueOnce(mockMember);

    await act(async () => {
      await result.current.createMember(mockInput);
    });

    expect(result.current.error).toBeNull();
  });
});

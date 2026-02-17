import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiError, get, post, patch, getPaginated } from './client';

describe('ApiError', () => {
  it('creates error with correct properties', () => {
    const error = new ApiError('NOT_FOUND', 'Resource not found', 404);

    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('ApiError');
  });

  it('includes details when provided', () => {
    const details = [{ field: 'email', message: 'Invalid email', code: 'invalid_format' }];
    const error = new ApiError('VALIDATION_ERROR', 'Validation failed', 400, details);

    expect(error.details).toEqual(details);
  });
});

describe('API client', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('get', () => {
    it('makes GET request with correct headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { id: '1', name: 'Test' } }),
      });

      await get('/members/1');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/members/1',
        expect.objectContaining({
          method: 'GET',
          headers: { Accept: 'application/json' },
        })
      );
    });

    it('appends query params to URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [] }),
      });

      await get('/members', { page: 1, search: 'john' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/members?page=1&search=john',
        expect.any(Object)
      );
    });

    it('throws ApiError on server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(get('/members')).rejects.toMatchObject({
        code: 'SERVER_ERROR',
        statusCode: 500,
      });
    });

    it('throws ApiError instance on server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(get('/members')).rejects.toThrow(ApiError);
    });

    it('throws ApiError with details on validation error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: [{ field: 'email', message: 'Required', code: 'required' }],
          },
        }),
      });

      await expect(get('/members')).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        details: [{ field: 'email', message: 'Required', code: 'required' }],
      });
    });
  });

  describe('post', () => {
    it('makes POST request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ success: true, data: { id: '1' } }),
      });

      const body = { firstName: 'John', lastName: 'Doe' };
      await post('/members', body);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/members',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
        })
      );
    });
  });

  describe('patch', () => {
    it('makes PATCH request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { id: '1', status: 'cancelled' } }),
      });

      const body = { cancelledAt: '2024-01-15' };
      await patch('/memberships/1/cancel', body);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/memberships/1/cancel',
        expect.objectContaining({
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
        })
      );
    });

    it('returns response data on success', async () => {
      const responseData = { id: '1', status: 'cancelled', cancelledAt: '2024-01-15' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: responseData }),
      });

      const result = await patch('/memberships/1/cancel', {});

      expect(result).toEqual(responseData);
    });

    it('throws ApiError on validation error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid date',
            details: [{ field: 'cancelledAt', message: 'Must be a valid date', code: 'invalid_date' }],
          },
        }),
      });

      await expect(patch('/memberships/1/cancel', {})).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Invalid date',
      });
    });
  });

  describe('timeout and network errors', () => {
    it('throws TIMEOUT error when request times out', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      await expect(get('/members')).rejects.toMatchObject({
        code: 'TIMEOUT',
        message: 'Request timed out',
      });
    });

    it('throws NETWORK_ERROR when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(get('/members')).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
      });
    });

    it('throws NETWORK_ERROR on invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(get('/members')).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
        message: 'Invalid response from server',
      });
    });
  });

  describe('getPaginated', () => {
    it('returns data with meta', async () => {
      const mockResponse = {
        success: true,
        data: [{ id: '1' }, { id: '2' }],
        meta: {
          page: 1,
          pageSize: 10,
          totalCount: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await getPaginated('/members');

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('throws error when meta is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [] }),
      });

      await expect(getPaginated('/members')).rejects.toMatchObject({
        code: 'INVALID_RESPONSE',
      });
    });
  });
});

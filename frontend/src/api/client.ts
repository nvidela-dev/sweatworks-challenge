import type { ApiErrorData, ApiResponse, PaginationMeta } from '@/types';

const API_BASE = '/api';
const DEFAULT_TIMEOUT_MS = 15000;

export class ApiError extends Error {
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
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

function buildQueryString(params: object): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

function createAbortController(timeoutMs: number = DEFAULT_TIMEOUT_MS): {
  signal: AbortSignal;
  clear: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  };
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  try {
    return await response.json();
  } catch {
    throw new ApiError(
      'NETWORK_ERROR',
      'Invalid response from server',
      response.status
    );
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok && response.status >= 500) {
    throw new ApiError(
      'SERVER_ERROR',
      `Server error: ${response.status}`,
      response.status
    );
  }

  const data = await parseJsonResponse<ApiResponse<T>>(response);

  if (!data.success) {
    const error = data.error as ApiErrorData;
    throw new ApiError(error.code, error.message, response.status, error.details);
  }

  return data.data;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs?: number
): Promise<Response> {
  const { signal, clear } = createAbortController(timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal });
    clear();
    return response;
  } catch (error) {
    clear();
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('TIMEOUT', 'Request timed out', 0);
    }
    throw new ApiError('NETWORK_ERROR', 'Network request failed', 0);
  }
}

export async function get<T>(endpoint: string, params: object = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}${buildQueryString(params)}`;
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  return handleResponse<T>(response);
}

export async function post<T>(endpoint: string, body: unknown): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

export async function patch<T>(endpoint: string, body: unknown): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetchWithTimeout(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

export async function getPaginated<T>(
  endpoint: string,
  params: object = {}
): Promise<{ data: T[]; meta: PaginationMeta }> {
  const url = `${API_BASE}${endpoint}${buildQueryString(params)}`;
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok && response.status >= 500) {
    throw new ApiError(
      'SERVER_ERROR',
      `Server error: ${response.status}`,
      response.status
    );
  }

  const json = await parseJsonResponse<ApiResponse<T[]>>(response);

  if (!json.success) {
    const error = json.error as ApiErrorData;
    throw new ApiError(error.code, error.message, response.status, error.details);
  }

  if (!json.meta) {
    throw new ApiError(
      'INVALID_RESPONSE',
      'Paginated response missing meta field',
      response.status
    );
  }

  return {
    data: json.data,
    meta: json.meta,
  };
}

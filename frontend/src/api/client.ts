import type { ApiErrorData, ApiResponse, PaginationMeta } from '@/types';

const API_BASE = '/api';

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

async function handleResponse<T>(response: Response): Promise<T> {
  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    const error = data.error as ApiErrorData;
    throw new ApiError(error.code, error.message, response.status, error.details);
  }

  return data.data;
}

export async function get<T>(endpoint: string, params: object = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}${buildQueryString(params)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<T>(response);
}

export async function post<T>(endpoint: string, body: unknown): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

export async function patch<T>(endpoint: string, body: unknown): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
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
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const json: ApiResponse<T[]> = await response.json();

  if (!json.success) {
    const error = json.error as ApiErrorData;
    throw new ApiError(error.code, error.message, response.status, error.details);
  }

  return {
    data: json.data,
    meta: json.meta!,
  };
}

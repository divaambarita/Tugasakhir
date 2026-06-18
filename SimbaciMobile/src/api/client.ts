import {buildApiUrl} from '../config';
import type {ApiResponse} from './types';
import type {CurrentUser} from '../auth/types';
import {emitAuthExpired} from '../auth/authEvents';

function looksLikeJwtExpiredMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('jwt expired') ||
    m.includes('token expired') ||
    m.includes('token kadaluarsa') ||
    m.includes('token telah kedaluwarsa')
  );
}

export type LoginRequest = {
  noTelp: string;
  password: string;
};

export async function apiRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    token?: string;
    body?: unknown;
    signal?: AbortSignal;
  } = {},
): Promise<ApiResponse<T>> {
  const url = buildApiUrl(path);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    return {
      status: res.status,
      success: false,
      message: 'Invalid server response',
      errors: [],
    };
  }

  // If a request was made with an Authorization token and the server says
  // unauthorized / token expired, immediately force logout.
  if (options.token) {
    const message = (json as any)?.message;
    const isUnauthorized = res.status === 401;
    const isExpiredMessage =
      typeof message === 'string' && looksLikeJwtExpiredMessage(message);
    if (isUnauthorized || isExpiredMessage) {
      emitAuthExpired({status: res.status, message});
    }
  }

  return json as ApiResponse<T>;
}

export async function login(
  payload: LoginRequest,
): Promise<ApiResponse<CurrentUser>> {
  return apiRequest<CurrentUser>('/api/login', {
    method: 'POST',
    body: payload,
  });
}

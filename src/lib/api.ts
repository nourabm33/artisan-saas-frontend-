import { API_URL } from './constants';
import { clearSession, getAccessToken, getRefreshToken, saveTokens } from './auth';
import type {
  ApiErrorBody,
  AppointmentResponse,
  ListAppointmentsParams,
  ListAppointmentsResponse,
  ListRequestsParams,
  ListRequestsResponse,
  LoginBody,
  MeResponse,
  QuoteResponse,
  RegisterBody,
  RequestDetailResponse,
  RescheduleBody,
  SendQuoteResponse,
  ServicesResponse,
  UpdateQuoteBody,
  UpdateQuoteStatusBody,
} from '@/types/api';
import type { AppointmentStatus, AuthResult, AuthTokens } from '@/types';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const UNAUTHORIZED_EVENT = 'artisan:unauthorized';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${API_URL}/api/v1${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function parseError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody | null = null;
  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    body = null;
  }
  return new ApiError(
    response.status,
    body?.error?.code ?? 'HTTP_ERROR',
    body?.error?.message ?? `Errore ${response.status}`,
    body?.error?.details
  );
}

let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    const response = await fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { tokens: AuthTokens };
    saveTokens(data.tokens);
    return true;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function request<T>(path: string, options: RequestOptions = {}, retry = true): Promise<T> {
  const { method = 'GET', body, auth = false, query } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401 && auth && retry && (await tryRefresh())) {
    return request<T>(path, options, false);
  }

  if (response.status === 401 && auth) {
    clearSession();
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  auth: {
    register: (data: RegisterBody) => request<AuthResult>('/auth/register', { method: 'POST', body: data }),
    login: (data: LoginBody) => request<AuthResult>('/auth/login', { method: 'POST', body: data }),
    me: () => request<MeResponse>('/auth/me', { auth: true }),
  },
  serviceTemplates: {
    list: () => request<ServicesResponse>('/service-templates', { auth: true }),
  },
  requests: {
    list: (params: ListRequestsParams = {}) =>
      request<ListRequestsResponse>('/requests', { auth: true, query: { ...params } }),
    getById: (id: string) => request<RequestDetailResponse>(`/requests/${id}`, { auth: true }),
  },
  quotes: {
    getById: (id: string) => request<QuoteResponse>(`/quotes/${id}`, { auth: true }),
    update: (id: string, data: UpdateQuoteBody) =>
      request<QuoteResponse>(`/quotes/${id}`, { method: 'PATCH', body: data, auth: true }),
    updateStatus: (id: string, data: UpdateQuoteStatusBody) =>
      request<QuoteResponse>(`/quotes/${id}/status`, { method: 'PATCH', body: data, auth: true }),
    send: (id: string) => request<SendQuoteResponse>(`/quotes/${id}/send`, { method: 'POST', auth: true }),
  },
  appointments: {
    list: (params: ListAppointmentsParams = {}) =>
      request<ListAppointmentsResponse>('/appointments', { auth: true, query: { ...params } }),
    getById: (id: string) => request<AppointmentResponse>(`/appointments/${id}`, { auth: true }),
    updateStatus: (id: string, status: AppointmentStatus) =>
      request<AppointmentResponse>(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: { status },
        auth: true,
      }),
    reschedule: (id: string, data: RescheduleBody) =>
      request<AppointmentResponse>(`/appointments/${id}/schedule`, {
        method: 'PATCH',
        body: data,
        auth: true,
      }),
  },
};

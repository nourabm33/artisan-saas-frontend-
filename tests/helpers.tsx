import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { vi } from 'vitest';
import { AuthProvider } from '@/hooks/useAuth';
import { STORAGE_KEYS } from '@/lib/constants';
import type { User } from '@/types';

export { push, replace } from './router-mock';

export const demoUser: User = {
  id: 'u1',
  orgId: 'o1',
  email: 'demo@gommista.it',
  firstName: 'Mario',
  lastName: 'Rossi',
  role: 'owner',
};

export function loginAs(user: User = demoUser) {
  window.localStorage.setItem(STORAGE_KEYS.accessToken, 'access');
  window.localStorage.setItem(STORAGE_KEYS.refreshToken, 'refresh');
  window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export function renderWithAuth(ui: ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

type Handler = (url: URL, init: RequestInit) => { status?: number; body?: unknown } | undefined;

/** Installs a fetch mock; `handler` returns the response for a given URL, or undefined for 404. */
export function mockFetch(handler: Handler) {
  const calls: { url: URL; init: RequestInit }[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    calls.push({ url, init });
    const res = handler(url, init) ?? {
      status: 404,
      body: { error: { code: 'NOT_FOUND', message: 'Not found' } },
    };
    const status = res.status ?? 200;
    return new Response(JSON.stringify(res.body ?? {}), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, calls };
}

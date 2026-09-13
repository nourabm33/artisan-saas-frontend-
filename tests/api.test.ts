import { describe, expect, it } from 'vitest';
import { api, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { loginAs, mockFetch } from './helpers';

describe('api client', () => {
  it('sends the bearer token and unwraps JSON', async () => {
    loginAs();
    const { calls } = mockFetch((url) =>
      url.pathname === '/api/v1/requests' ? { body: { requests: [], limit: 50, offset: 0 } } : undefined
    );
    const result = await api.requests.list({ status: 'quoted', limit: 10 });
    expect(result.requests).toEqual([]);
    expect(calls[0].url.searchParams.get('status')).toBe('quoted');
    expect(calls[0].url.searchParams.get('limit')).toBe('10');
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer access');
  });

  it('throws ApiError with the backend error shape', async () => {
    mockFetch(() => ({
      status: 401,
      body: { error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } },
    }));
    await expect(api.auth.login({ email: 'a@b.it', password: 'x' })).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Invalid credentials',
    });
  });

  it('refreshes the access token once on 401 and retries', async () => {
    loginAs();
    let attempts = 0;
    const { calls } = mockFetch((url) => {
      if (url.pathname === '/api/v1/auth/refresh') {
        return { body: { tokens: { accessToken: 'fresh', refreshToken: 'fresh-r' } } };
      }
      if (url.pathname === '/api/v1/auth/me') {
        attempts += 1;
        return attempts === 1
          ? { status: 401, body: { error: { code: 'UNAUTHORIZED', message: 'expired' } } }
          : { body: { user: { id: 'u1' } } };
      }
      return undefined;
    });
    const result = await api.auth.me();
    expect(result.user.id).toBe('u1');
    expect(getAccessToken()).toBe('fresh');
    expect(calls.map((c) => c.url.pathname)).toEqual([
      '/api/v1/auth/me',
      '/api/v1/auth/refresh',
      '/api/v1/auth/me',
    ]);
    expect((calls[2].init.headers as Record<string, string>).Authorization).toBe('Bearer fresh');
  });

  it('clears the session when the refresh fails', async () => {
    loginAs();
    mockFetch(() => ({ status: 401, body: { error: { code: 'UNAUTHORIZED', message: 'nope' } } }));
    await expect(api.auth.me()).rejects.toBeInstanceOf(ApiError);
    expect(getAccessToken()).toBeNull();
  });
});

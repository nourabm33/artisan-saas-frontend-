import { STORAGE_KEYS } from './constants';
import type { AuthTokens, User } from '@/types';

const isBrowser = () => typeof window !== 'undefined';

export function getAccessToken(): string | null {
  return isBrowser() ? window.localStorage.getItem(STORAGE_KEYS.accessToken) : null;
}

export function getRefreshToken(): string | null {
  return isBrowser() ? window.localStorage.getItem(STORAGE_KEYS.refreshToken) : null;
}

export function getStoredUser(): User | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    clearSession();
    return null;
  }
}

export function saveSession(user: User, tokens: AuthTokens): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
  window.localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
  window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export function saveTokens(tokens: AuthTokens): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
  window.localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
}

export function clearSession(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEYS.accessToken);
  window.localStorage.removeItem(STORAGE_KEYS.refreshToken);
  window.localStorage.removeItem(STORAGE_KEYS.user);
}

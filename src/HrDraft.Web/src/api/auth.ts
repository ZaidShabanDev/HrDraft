import type { CurrentUser } from '../types/domain';
import { apiFetch } from './client';

export function signIn(email: string, password: string): Promise<CurrentUser> {
  return apiFetch<CurrentUser>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function signOut(): Promise<void> {
  return apiFetch<void>('/auth/logout', { method: 'POST' });
}

/** Throws `ApiError` with status 401 when nobody is signed in — that is the normal answer. */
export function fetchCurrentUser(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>('/auth/me');
}

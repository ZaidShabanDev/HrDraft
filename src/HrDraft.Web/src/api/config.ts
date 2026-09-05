import type { AppConfig } from '../config/appConfig';
import { apiFetch } from './client';

/**
 * Public and pre-auth: the login screen needs the logo, product name and enabled
 * sign-in methods before anyone has signed in.
 */
export function fetchAppConfig(): Promise<AppConfig> {
  return apiFetch<AppConfig>('/config');
}

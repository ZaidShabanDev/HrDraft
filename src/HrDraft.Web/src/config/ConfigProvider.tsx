import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_CONFIG } from './appConfig';
import type { AppConfig, BrandStep, ThemeConfig } from './appConfig';
import deploymentConfig from './deployment.json';

const ConfigContext = createContext<AppConfig>(DEFAULT_CONFIG);

export function useAppConfig(): AppConfig {
  return useContext(ConfigContext);
}

/** Convenience — branding is what most components actually want. */
export function useBranding() {
  return useAppConfig().branding;
}

/**
 * Merges the deployment's `deployment.json` over the defaults, one level deep
 * per section, so a deployment only has to state what it changes rather than
 * restating the whole object.
 *
 * Phase 2 replaces the import with a fetch of `GET /api/config`; the merge and
 * everything below it stay as they are.
 */
function resolveConfig(): AppConfig {
  const file = deploymentConfig as DeepPartial<AppConfig>;
  return {
    branding: {
      ...DEFAULT_CONFIG.branding,
      ...file.branding,
      logo: { ...DEFAULT_CONFIG.branding.logo, ...file.branding?.logo },
      theme: { ...DEFAULT_CONFIG.branding.theme, ...file.branding?.theme },
    },
    auth: {
      ...DEFAULT_CONFIG.auth,
      ...file.auth,
      entra: { ...DEFAULT_CONFIG.auth.entra, ...file.auth?.entra },
      ldap: { ...DEFAULT_CONFIG.auth.ldap, ...file.auth?.ldap },
    },
    dailyGenerationLimit: file.dailyGenerationLimit ?? DEFAULT_CONFIG.dailyGenerationLimit,
  };
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const config = useMemo(resolveConfig, []);

  // The theme is applied as custom properties on :root rather than as a class or
  // a styled-components theme. That's the payoff for building on CSS custom
  // properties instead of a utility framework: a company's palette is a handful
  // of variable assignments, and every existing rule picks it up untouched.
  useMemo(() => applyTheme(config.branding.theme), [config.branding.theme]);

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

const RAMP_STEPS: BrandStep[] = ['100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

function applyTheme(theme: ThemeConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Setting the seed is enough on its own — tokens.css derives the ramp from it
  // in OKLCH. The explicit steps below are only for brand guidelines that pin
  // exact values.
  root.style.setProperty('--brand', theme.brand);

  for (const step of RAMP_STEPS) {
    const override = theme.brandRamp?.[step];
    if (override) root.style.setProperty(`--brand-${step}`, override);
  }

  if (theme.danger) root.style.setProperty('--color-danger', theme.danger);
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

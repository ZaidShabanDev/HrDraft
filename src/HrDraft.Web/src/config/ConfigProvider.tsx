import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchAppConfig } from '../api/config';
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
 * Merges a partial config over the defaults, one level deep per section, so a
 * source only has to state what it changes rather than restating the whole object.
 */
function mergeConfig(source: DeepPartial<AppConfig>): AppConfig {
  return {
    branding: {
      ...DEFAULT_CONFIG.branding,
      ...source.branding,
      logo: { ...DEFAULT_CONFIG.branding.logo, ...source.branding?.logo },
      theme: { ...DEFAULT_CONFIG.branding.theme, ...source.branding?.theme },
    },
    auth: {
      ...DEFAULT_CONFIG.auth,
      ...source.auth,
      entra: { ...DEFAULT_CONFIG.auth.entra, ...source.auth?.entra },
      ldap: { ...DEFAULT_CONFIG.auth.ldap, ...source.auth?.ldap },
    },
    dailyGenerationLimit: source.dailyGenerationLimit ?? DEFAULT_CONFIG.dailyGenerationLimit,
  };
}

/**
 * Two sources, in this order of authority:
 *
 * 1. **`GET /api/config`** — the real one. A deployment configures itself in
 *    `appsettings.json` and gets a rebranded app without rebuilding the SPA.
 * 2. **`deployment.json`** — used until that response arrives, and kept if it never
 *    does. That is what lets `npm run dev` work on its own for front-end work with
 *    no backend running.
 *
 * The local file is applied synchronously so the brand colour is on `:root` before
 * the first paint. The server's answer replaces it a moment later; identical values
 * are the normal case, so there is nothing to see.
 */
export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(() =>
    mergeConfig(deploymentConfig as DeepPartial<AppConfig>),
  );

  useEffect(() => {
    let cancelled = false;

    fetchAppConfig()
      .then((fromServer) => {
        if (!cancelled) setConfig(mergeConfig(fromServer as DeepPartial<AppConfig>));
      })
      .catch(() => {
        // No backend, or it is down. The local file already rendered a complete,
        // branded app — failing to a blank screen over a config read would be worse
        // than being one deploy behind on the wording.
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

/**
 * Deployment configuration — everything a company changes to make HrDraft
 * theirs. Nothing in the UI may hard-code a company name, logo or colour.
 *
 * This is the exact shape the server's `GET /api/config` will return. Consumers
 * read it through `useAppConfig()` and never touch this module directly, so when
 * the endpoint lands the only change is where the object comes from — no screen,
 * component or stylesheet is affected.
 *
 * The endpoint is deliberately public and pre-auth: the login screen needs the
 * logo, product name and enabled sign-in methods before anyone has signed in.
 * Keep it free of anything sensitive. Client secrets stay server-side.
 */

export interface ThemeConfig {
  /**
   * The company's brand colour — the single value most deployments will change.
   *
   * The full 100–950 ramp is derived from it in OKLCH at fixed lightness steps,
   * so contrast behaves predictably whatever the hue. See styles/tokens.css.
   */
  brand: string;
  /**
   * Optional per-step overrides, for a brand guideline that specifies exact
   * values rather than letting them be derived. Any step left out is derived.
   * Keys are ramp steps: '100' … '950'.
   */
  brandRamp?: Partial<Record<BrandStep, string>>;
  /** Destructive-action colour. Rarely worth changing. */
  danger?: string;
}

export type BrandStep =
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | '950';

export interface LogoConfig {
  /** Shown on the navy chrome and the login panel. */
  onDark: string | null;
  /** Shown on the light ground, in breadcrumbs. */
  onLight: string | null;
  /** Rendered as a text wordmark wherever a logo is absent. */
  wordmark: string;
}

export interface BrandingConfig {
  /** The deploying company. Appears in copy and feeds generated documents. */
  companyName: string;
  /** The tool's own name. Only change this if you're forking. */
  productName: string;
  /** Login panel eyebrow — the company's own line, not the product's. */
  tagline: string;
  /** The team that owns the tool, e.g. "People & Culture". */
  departmentName: string;
  /** Login footer. Deployments in regulated sectors usually reword this. */
  confidentialityNotice: string;
  /** Pre-fills the login field's placeholder and seeds example data. */
  emailDomain: string;
  logo: LogoConfig;
  theme: ThemeConfig;
}

/**
 * Sign-in methods. Each is independent — a deployment can offer local passwords
 * while it waits for its identity provider, then turn local off.
 *
 * A method that isn't configured is *hidden*, never shown disabled: an option
 * nobody can use is worse than no option.
 */
export interface AuthConfig {
  /** Email + password against the app's own user table. */
  local: boolean;
  /** Microsoft Entra ID. Client ID and tenant live server-side. */
  entra: { enabled: boolean; buttonLabel: string };
  /**
   * Direct LDAP bind against a domain controller, for on-prem AD with no
   * federation layer.
   *
   * Note for anyone enabling this: the app handles real domain passwords in
   * transit, so HTTPS is mandatory rather than advisable, and some security
   * policies forbid it outright. Prefer Entra where it exists.
   */
  ldap: { enabled: boolean; domainLabel: string };
}

export interface AppConfig {
  branding: BrandingConfig;
  auth: AuthConfig;
  /** Per-user daily generation cap, shown in the chrome. */
  dailyGenerationLimit: number;
}

/**
 * What a fresh clone runs with: no company, no logo, local login only.
 *
 * A first run has to look finished rather than half-configured, which is why
 * the logo falls back to a wordmark and the product name stands in for the
 * company until one is set.
 */
export const DEFAULT_CONFIG: AppConfig = {
  branding: {
    companyName: 'Your Company',
    productName: 'HrDraft',
    tagline: 'Recruiting and onboarding documents, drafted',
    departmentName: 'People & Culture',
    confidentialityNotice:
      'Drafts contain employee and salary data. Do not share outside the company.',
    emailDomain: 'example.com',
    logo: {
      onDark: null,
      onLight: null,
      wordmark: 'HrDraft',
    },
    theme: {
      // A neutral professional blue. Deployments replace this one value.
      brand: '#0d93ea',
    },
  },
  auth: {
    local: true,
    entra: { enabled: false, buttonLabel: 'Continue with Microsoft' },
    ldap: { enabled: false, domainLabel: 'Domain username' },
  },
  dailyGenerationLimit: 20,
};

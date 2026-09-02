import { useBranding } from '../config/ConfigProvider';

export type LogoSurface = 'dark' | 'light';

export interface BrandLogoProps {
  /** Which ground it sits on — picks the matching asset. */
  surface: LogoSurface;
  /** Size class: the chrome bar, the login panel, or a breadcrumb. */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * The company's mark, wherever one appears.
 *
 * Falls back to a text wordmark when no logo file is configured, so a fresh
 * clone looks finished instead of showing a broken image. That fallback is the
 * default state of the project, not an edge case — most people will see it
 * before they see their own logo.
 */
export function BrandLogo({ surface, size = 'sm' }: BrandLogoProps) {
  const branding = useBranding();
  const src = surface === 'dark' ? branding.logo.onDark : branding.logo.onLight;
  const className = `brand-logo brand-logo-${size} brand-logo-${surface}`;

  if (!src) {
    return (
      <span className={`${className} brand-wordmark`}>{branding.logo.wordmark}</span>
    );
  }

  return <img src={src} alt={branding.companyName} className={className} />;
}

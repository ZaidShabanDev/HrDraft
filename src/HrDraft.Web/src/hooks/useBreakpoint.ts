import { useEffect, useState } from 'react';

/**
 * Breakpoints from design artboard 2a. Keep in step with styles/responsive.css.
 */
export const BREAKPOINTS = {
  tablet: 834,
  desktop: 1280,
} as const;

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

function read(): Breakpoint {
  // Guard for the first render in a non-browser context.
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w >= BREAKPOINTS.desktop) return 'desktop';
  if (w >= BREAKPOINTS.tablet) return 'tablet';
  return 'phone';
}

/**
 * The single source of truth for layout decisions that CSS cannot express —
 * chiefly Dialog→BottomSheet, Menu→ActionSheet and DataTable→StackedRowList,
 * where the two branches render different markup rather than different styles.
 *
 * Prefer a CSS media query whenever the markup is the same.
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(read);

  useEffect(() => {
    const tablet = window.matchMedia(`(min-width: ${BREAKPOINTS.tablet}px)`);
    const desktop = window.matchMedia(`(min-width: ${BREAKPOINTS.desktop}px)`);

    const update = () => setBreakpoint(read());

    tablet.addEventListener('change', update);
    desktop.addEventListener('change', update);
    return () => {
      tablet.removeEventListener('change', update);
      desktop.removeEventListener('change', update);
    };
  }, []);

  return breakpoint;
}

export function useIsPhone(): boolean {
  return useBreakpoint() === 'phone';
}

/** True on tablet and phone — the widths where the side rails are dropped. */
export function useIsRailCollapsed(): boolean {
  return useBreakpoint() !== 'desktop';
}

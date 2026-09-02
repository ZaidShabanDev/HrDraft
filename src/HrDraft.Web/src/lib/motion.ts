import type { MotionProps } from 'motion/react';

/**
 * `Transition` and `Variants` are not re-exported from `motion/react` in v13 —
 * they live in the transitive `motion-dom` package. Deriving them from the
 * public `MotionProps` keeps us off an internal dependency we don't declare.
 */
type Transition = NonNullable<MotionProps['transition']>;
type Variants = NonNullable<MotionProps['variants']>;

/**
 * Motion presets — the single source of truth for movement in the app.
 *
 * Read this before adding an animation:
 *
 * 1. **Never use a spring.** Motion springs by default on transforms, and springs
 *    overshoot. This design system is flat and architectural: surfaces travel in a
 *    straight line and stop. Every transition here is an explicit tween, and
 *    `MotionConfig` in App.tsx makes that the global default.
 * 2. **Motion handles state and presence** — mount/unmount, open/closed, layout.
 *    Pointer feedback (hover tints, active states) stays in CSS: it needs no React
 *    render and works before hydration. See design-system-rules.md §7.
 * 3. Durations and easings mirror the CSS tokens so the two layers agree.
 */

/** A cubic-bezier control point set. Not `as const` — Motion's `ease` expects a
 *  mutable tuple, and a readonly one isn't assignable to it. */
type Bezier = [number, number, number, number];

/** Mirrors --ease: decelerating, for things entering. */
export const EASE: Bezier = [0.2, 0, 0.3, 1];

/** Mirrors --ease-exit: accelerating, for things leaving. */
export const EASE_EXIT: Bezier = [0.4, 0, 1, 1];

export const DURATION = {
  fast: 0.12,
  base: 0.18,
  slow: 0.24,
} as const;

/** How far a surface travels as it appears — mirrors --shift-sm / --shift-md. */
const SHIFT_SM = 4;
const SHIFT_MD = 8;

/** The global default. Applied via <MotionConfig> so nothing falls back to a spring. */
export const DEFAULT_TRANSITION: Transition = {
  type: 'tween',
  duration: DURATION.base,
  ease: EASE,
};

export const fastTween: Transition = {
  type: 'tween',
  duration: DURATION.fast,
  ease: EASE,
};

export const slowTween: Transition = {
  type: 'tween',
  duration: DURATION.slow,
  ease: EASE,
};

const exitTween: Transition = {
  type: 'tween',
  duration: DURATION.fast,
  ease: EASE_EXIT,
};

/* ── Presence variants ─────────────────────────────────────────────────────
   Each surface moves along the axis it belongs to, so the motion explains the
   layout rather than decorating it. */

/** Dropdowns and menus: drop away from the trigger above them. */
export const dropIn: Variants = {
  hidden: { opacity: 0, y: -SHIFT_SM },
  visible: { opacity: 1, y: 0, transition: fastTween },
  exit: { opacity: 0, y: -SHIFT_SM, transition: exitTween },
};

/** Typeahead panel: joined to the field, so it grows from that edge. */
export const unfurl: Variants = {
  hidden: { opacity: 0, scaleY: 0.96 },
  visible: { opacity: 1, scaleY: 1, transition: fastTween },
  exit: { opacity: 0, scaleY: 0.96, transition: exitTween },
};

/** Dialogs: rise into place. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: SHIFT_MD },
  visible: { opacity: 1, y: 0, transition: DEFAULT_TRANSITION },
  exit: { opacity: 0, y: SHIFT_MD, transition: exitTween },
};

/** Bottom sheets: arrive from the edge they dock to. */
export const slideUp: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: slowTween },
  exit: { y: '100%', transition: { ...exitTween, duration: DURATION.base } },
};

/** The phone navigation drawer. */
export const slideInRight: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: slowTween },
  exit: { x: '100%', transition: { ...exitTween, duration: DURATION.base } },
};

/** Scrims only ever fade. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: DEFAULT_TRANSITION },
  exit: { opacity: 0, transition: exitTween },
};

/**
 * Toasts rise in and leave sideways on desktop. On phone they span the width, so
 * sliding out would clip — the caller passes `phone` to drop them instead.
 */
export function toastVariants(phone: boolean): Variants {
  return {
    hidden: { opacity: 0, y: SHIFT_MD },
    visible: { opacity: 1, x: 0, y: 0, transition: DEFAULT_TRANSITION },
    exit: phone
      ? { opacity: 0, y: SHIFT_MD, transition: exitTween }
      : { opacity: 0, x: SHIFT_MD, transition: exitTween },
  };
}

/** Collapsible content: height-to-auto, which CSS cannot interpolate. */
export const revealHeight: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: DEFAULT_TRANSITION },
  exit: { height: 0, opacity: 0, transition: exitTween },
};

/** Skeleton pulse — conveys "working" during a ~20s generation. */
export const skeletonPulse: {
  animate: NonNullable<MotionProps['animate']>;
  transition: Transition;
} = {
  animate: { opacity: [0.7, 0.35, 0.7] },
  transition: {
    duration: 1.6,
    ease: EASE,
    repeat: Number.POSITIVE_INFINITY,
  },
};

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useIsPhone } from '../hooks/useBreakpoint';
import { EASE, skeletonPulse, toastVariants } from '../lib/motion';

/* ── Banner ──────────────────────────────────────────────────────────────── */

export interface BannerProps {
  kicker: string;
  children: ReactNode;
  tone?: 'accent' | 'danger';
  action?: ReactNode;
}

/** Inline, persistent notice — the "Human check needed" flag lives here. */
export function Banner({ kicker, children, tone = 'accent', action }: BannerProps) {
  return (
    <div className={`banner${tone === 'danger' ? ' banner-danger' : ''}`}>
      <h6 className={tone === 'danger' ? 'kicker-danger' : 'kicker-accent'}>{kicker}</h6>
      <p className="banner-body">{children}</p>
      {action}
    </div>
  );
}

/* ── Progress ────────────────────────────────────────────────────────────── */

export interface ProgressBarProps {
  /** 0–100. Omit for an indeterminate bar. */
  percent?: number;
  caption?: string;
  label: string;
}

export function ProgressBar({ percent, caption, label }: ProgressBarProps) {
  const clamped = percent === undefined ? undefined : Math.min(100, Math.max(0, percent));

  return (
    <div className="progress-block">
      <div
        className="progress"
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={clamped === undefined ? undefined : 0}
        aria-valuemax={clamped === undefined ? undefined : 100}
      >
        {clamped === undefined ? (
          /* Indeterminate stays a CSS keyframe: it's a decorative loop with no
             React state behind it, so there's nothing for Motion to drive. */
          <span className="progress-indeterminate" />
        ) : (
          <motion.span
            initial={false}
            animate={{ width: `${clamped}%` }}
            transition={{ duration: 0.3, ease: EASE }}
          />
        )}
      </div>
      {caption ? <span className="progress-caption text-muted">{caption}</span> : null}
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */

/** Widths taken from artboard 3a panel 08 — deliberately uneven so it reads as
 *  text rather than as a loading bar. */
const SKELETON_WIDTHS = ['70%', '100%', '92%', '48%'];

export interface SkeletonProps {
  /** Repeats the four-line pattern this many times. */
  blocks?: number;
}

export function Skeleton({ blocks = 1 }: SkeletonProps) {
  return (
    <div className="skeleton" aria-hidden="true">
      {Array.from({ length: blocks }).flatMap((_, block) =>
        SKELETON_WIDTHS.map((width, line) => (
          <motion.span
            key={`${block}-${line}`}
            style={{ width }}
            animate={skeletonPulse.animate}
            transition={{
              ...skeletonPulse.transition,
              // Staggered so the block reads as one wave, not a flat blink.
              delay: (block * SKELETON_WIDTHS.length + line) * 0.12,
            }}
          />
        )),
      )}
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────── */

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h6>{title}</h6>
      <p className="text-muted empty-state-body">{description}</p>
      {action}
    </div>
  );
}

/* ── Toasts ──────────────────────────────────────────────────────────────── */

export interface ToastSpec {
  id: number;
  message: string;
  tone: 'success' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastApi {
  show: (toast: Omit<ToastSpec, 'id'>) => void;
  dismiss: (id: number) => void;
}

const TOAST_LIFETIME_MS = 6000;

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside <ToastProvider>');
  return api;
}

let nextToastId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastSpec[]>([]);
  const isPhone = useIsPhone();

  // AnimatePresence keeps each toast mounted until its exit animation finishes,
  // so dismissing is a plain filter — no "leaving" flag, and no timeout kept in
  // sync with a CSS duration.
  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (toast: Omit<ToastSpec, 'id'>) => {
      const id = nextToastId++;
      setToasts((current) => [...current, { ...toast, id }]);
      // Errors stay until dismissed — they usually carry a retry the user needs.
      if (toast.tone === 'success') {
        window.setTimeout(() => dismiss(id), TOAST_LIFETIME_MS);
      }
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);
  const variants = useMemo(() => toastVariants(isPhone), [isPhone]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              className={`toast${toast.tone === 'error' ? ' toast-error' : ''}`}
              role={toast.tone === 'error' ? 'alert' : 'status'}
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <span>{toast.message}</span>
              {toast.actionLabel ? (
                <button
                  type="button"
                  className="toast-action"
                  onClick={() => {
                    toast.onAction?.();
                    dismiss(toast.id);
                  }}
                >
                  {toast.actionLabel}
                </button>
              ) : (
                <button
                  type="button"
                  className="toast-action"
                  aria-label="Dismiss"
                  onClick={() => dismiss(toast.id)}
                >
                  <span aria-hidden="true">✕</span>
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

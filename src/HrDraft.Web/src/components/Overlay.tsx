import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useIsPhone } from '../hooks/useBreakpoint';
import { fade, riseIn, slideInRight, slideUp } from '../lib/motion';

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/** Traps Tab inside the overlay and restores focus to the opener on close. */
function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const node = ref.current;
    node?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !node) return;
      const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) return;

      const first = items[0]!;
      const last = items[items.length - 1]!;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [active]);

  return ref;
}

/** Escape-to-close plus a scroll lock, for as long as the overlay is open. */
function useDismissible(open: boolean, onClose: () => void, enabled = true) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && enabled) onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, enabled]);
}

export interface DialogProps {
  /** The parent owns this; AnimatePresence needs a stable mount to animate exit. */
  open: boolean;
  /** Small uppercase label above the title — "Confirm", "Destructive". */
  kicker?: string;
  title: string;
  children: ReactNode;
  /** Right-aligned on desktop, stacked full-width on phone. */
  footer: ReactNode;
  onClose: () => void;
  destructive?: boolean;
  /** Hide the ✕ when the action must be resolved through the footer. */
  dismissible?: boolean;
}

/**
 * Centered dialog above 834px; a docked bottom sheet below it — the design is
 * explicit that phone dialogs dock and never center.
 */
export function Dialog({
  open,
  kicker,
  title,
  children,
  footer,
  onClose,
  destructive = false,
  dismissible = true,
}: DialogProps) {
  const isPhone = useIsPhone();
  const ref = useFocusTrap(open);
  const titleId = useId();

  useDismissible(open, onClose, dismissible);

  const header = (
    <div className="dialog-header">
      <div>
        {kicker ? (
          <h6 className={destructive ? 'kicker-danger' : 'kicker-accent'}>{kicker}</h6>
        ) : null}
        <h4 id={titleId}>{title}</h4>
      </div>
      {dismissible ? (
        <button type="button" className="dialog-close" aria-label="Close" onClick={onClose}>
          <span aria-hidden="true">✕</span>
        </button>
      ) : null}
    </div>
  );

  const body = (
    <>
      {header}
      <div className="dialog-body">{children}</div>
      <div className={`dialog-footer${isPhone ? ' dialog-footer-stacked' : ''}`}>{footer}</div>
    </>
  );

  return (
    <AnimatePresence>
      {open ? (
        isPhone ? (
          <div className="sheet-layer">
            <motion.div
              className="scrim"
              variants={fade}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={dismissible ? onClose : undefined}
            />
            <motion.div
              className={`sheet sheet-docked${destructive ? ' sheet-destructive' : ''}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              ref={ref}
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="sheet-handle" aria-hidden="true" />
              {body}
            </motion.div>
          </div>
        ) : (
          <div className="dialog-layer">
            <motion.div
              className="scrim"
              variants={fade}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={dismissible ? onClose : undefined}
            />
            <motion.div
              className={`dialog${destructive ? ' dialog-destructive' : ''}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              ref={ref}
              variants={riseIn}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {body}
            </motion.div>
          </div>
        )
      ) : null}
    </AnimatePresence>
  );
}

export interface DrawerProps {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
  label: string;
}

/** Phone navigation drawer — slides in from the right over a scrim strip. */
export function Drawer({ open, children, onClose, label }: DrawerProps) {
  const ref = useFocusTrap(open);
  useDismissible(open, onClose);

  return (
    <AnimatePresence>
      {open ? (
        <div className="drawer-layer">
          <motion.div
            className="scrim"
            variants={fade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          <motion.nav
            className="drawer paper-dark"
            aria-label={label}
            ref={ref}
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.nav>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

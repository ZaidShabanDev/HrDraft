import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useIsPhone } from '../hooks/useBreakpoint';
import { dropIn, fade, slideUp } from '../lib/motion';

export interface MenuAction {
  id: string;
  label: string;
  onSelect: () => void;
  /** Renders in danger red, behind a 2px separating rule. */
  destructive?: boolean;
  disabled?: boolean;
}

export interface MenuProps {
  /** The parent owns this; AnimatePresence needs a stable mount to animate exit. */
  open: boolean;
  /** Names the menu for screen readers, e.g. "Draft actions". */
  label: string;
  actions: MenuAction[];
  onClose: () => void;
  /** Optional identity block at the top — used by the account menu. */
  header?: ReactNode;
  align?: 'left' | 'right';
}

/**
 * Desktop/tablet dropdown menu; delegates to ActionSheet on phone, because the
 * design replaces menus with docked sheets below 834px.
 */
export function Menu({ open, label, actions, onClose, header, align = 'right' }: MenuProps) {
  const isPhone = useIsPhone();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!ref.current || !target) return;
      if (ref.current.contains(target)) return;
      // The trigger sits outside the menu, so closing here would fight the
      // trigger's own toggle and reopen immediately.
      if (target.closest('[aria-haspopup="menu"]')) return;
      onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        moveFocus(ref.current, e.key === 'ArrowDown' ? 1 : -1);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (isPhone) {
    return <ActionSheet open={open} label={label} actions={actions} onClose={onClose} />;
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={`menu menu-${align}`}
          role="menu"
          aria-label={label}
          ref={ref}
          variants={dropIn}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {header ? <div className="menu-header">{header}</div> : null}
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              className={`menu-item${action.destructive ? ' menu-item-destructive' : ''}`}
              disabled={action.disabled}
              onClick={() => {
                action.onSelect();
                onClose();
              }}
            >
              {action.label}
            </button>
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export interface ActionSheetProps {
  open: boolean;
  label: string;
  actions: MenuAction[];
  onClose: () => void;
  cancelLabel?: string;
}

/** Phone menu: docks to the bottom over a scrim, with an explicit Cancel. */
export function ActionSheet({
  open,
  label,
  actions,
  onClose,
  cancelLabel = 'Cancel',
}: ActionSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="sheet-layer">
          <motion.div
            className="scrim"
            variants={fade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            className="sheet sheet-docked"
            role="menu"
            aria-label={label}
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="sheet-handle" aria-hidden="true" />
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                role="menuitem"
                className={`sheet-item${action.destructive ? ' sheet-item-destructive' : ''}`}
                disabled={action.disabled}
                onClick={() => {
                  action.onSelect();
                  onClose();
                }}
              >
                {action.label}
              </button>
            ))}
            <button type="button" className="sheet-item sheet-item-cancel" onClick={onClose}>
              {cancelLabel}
            </button>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function moveFocus(container: HTMLElement | null, delta: number) {
  if (!container) return;
  const items = [...container.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:enabled')];
  if (items.length === 0) return;
  const current = items.findIndex((el) => el === document.activeElement);
  const next = (current + delta + items.length) % items.length;
  items[next]?.focus();
}

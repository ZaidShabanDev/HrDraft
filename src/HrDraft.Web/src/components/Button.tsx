import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'destructive'
  | 'destructive-solid'
  /** Navy fill — the SSO button and other chrome-coloured actions. */
  | 'brand-dark';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  destructive: 'btn-destructive',
  'destructive-solid': 'btn-destructive-solid',
  'brand-dark': 'btn-brand-dark',
};

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  /** Full width with a flush-left label — the system's wide-button form. */
  block?: boolean;
  /** Swaps the label for `loadingLabel` and blocks interaction. */
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}

export function Button({
  variant = 'secondary',
  block = false,
  loading = false,
  loadingLabel,
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    VARIANT_CLASS[variant],
    block ? 'btn-block' : '',
    loading ? 'btn-loading' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
    >
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, 'block' | 'children'> {
  /** Required — an icon-only button has no visible text to name it. */
  label: string;
  children: ReactNode;
}

export function IconButton({ label, variant = 'secondary', children, ...rest }: IconButtonProps) {
  return (
    <button
      {...rest}
      type={rest.type ?? 'button'}
      className={`btn ${VARIANT_CLASS[variant]} btn-icon`}
      aria-label={label}
    >
      {children}
    </button>
  );
}

export interface SplitButtonProps {
  label: string;
  onClick: () => void;
  /** Names the dropdown half for screen readers, e.g. "More export formats". */
  menuLabel: string;
  onMenuClick: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
}

/** A primary action with an adjacent dropdown affordance sharing one edge. */
export function SplitButton({
  label,
  onClick,
  menuLabel,
  onMenuClick,
  variant = 'secondary',
  disabled = false,
}: SplitButtonProps) {
  return (
    <span className="btn-split">
      <button
        type="button"
        className={`btn ${VARIANT_CLASS[variant]}`}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </button>
      <button
        type="button"
        className={`btn ${VARIANT_CLASS[variant]}`}
        onClick={onMenuClick}
        disabled={disabled}
        aria-label={menuLabel}
        aria-haspopup="menu"
      >
        <span aria-hidden="true">▾</span>
      </button>
    </span>
  );
}

export interface DockedActionBarProps {
  children: ReactNode;
  /** Splits the bar evenly instead of stretching only the leading action. */
  even?: boolean;
}

/**
 * Phone action bar. Sticks to the bottom edge so the primary action stays
 * reachable without scrolling — a design requirement, not a convenience.
 */
export function DockedActionBar({ children, even = false }: DockedActionBarProps) {
  return <div className={`docked-bar${even ? ' docked-bar-even' : ''}`}>{children}</div>;
}

import { useId } from 'react';
import { motion } from 'motion/react';
import { fastTween } from '../lib/motion';

export interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({ label, checked, onChange, disabled = false }: CheckboxProps) {
  return (
    <label className="checkbox">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="box" aria-hidden="true">
        ✓
      </span>
      <span>{label}</span>
    </label>
  );
}

export interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/** A checkbox in switch clothing — square track, square knob, no rounding. */
export function Toggle({ label, checked, onChange, disabled = false }: ToggleProps) {
  return (
    <label className="toggle">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="track" aria-hidden="true">
        {/* 34px track − 2px padding × 2 − 14px knob = 16px of travel. */}
        <motion.span
          className="knob"
          initial={false}
          animate={{ x: checked ? 16 : 0 }}
          transition={fastTween}
        />
      </span>
      <span>{label}</span>
    </label>
  );
}

export interface SegmentedOption {
  value: string;
  label: string;
  /** Shorter label used below 834px, e.g. "Snr" for "Senior". */
  shortLabel?: string;
}

export interface SegmentedControlProps {
  label: string;
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  /** Renders `shortLabel` where provided — the phone form of the control. */
  abbreviated?: boolean;
  /** Fills the container, dividing the width evenly between options. */
  fullWidth?: boolean;
  disabled?: boolean;
}

/**
 * A real radio group, not spans with aria-selected. The design's static mockup
 * uses spans because it has no behaviour; keyboard users need the real thing.
 */
export function SegmentedControl({
  label,
  options,
  value,
  onChange,
  abbreviated = false,
  fullWidth = false,
  disabled = false,
}: SegmentedControlProps) {
  const name = useId();
  // Scopes the shared layout animation to this control, so two segmented
  // controls on one screen don't slide their indicators into each other.
  const indicatorId = `seg-indicator-${name}`;

  return (
    <div className={`seg${fullWidth ? ' seg-full' : ''}`} role="radiogroup" aria-label={label}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label className="seg-opt" key={opt.value}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              disabled={disabled}
              onChange={() => onChange(opt.value)}
            />
            {/* The accent fill is one element that slides between options via a
                shared layoutId, rather than a background swapping on each. That
                travel is the thing plain CSS can't express. */}
            {selected ? (
              <motion.span
                layoutId={indicatorId}
                className="seg-indicator"
                transition={fastTween}
              />
            ) : null}
            <span className="seg-label">
              {abbreviated ? (opt.shortLabel ?? opt.label) : opt.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export interface ChipInputProps {
  label: string;
  /** Everything offered, selected or not. */
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

/**
 * Multi-select as chips. Selected chips fill and offer removal; unselected
 * chips outline and offer addition — the affordance is in the trailing glyph.
 */
export function ChipInput({ label, options, selected, onChange }: ChipInputProps) {
  const toggle = (option: string) => {
    onChange(
      selected.includes(option) ? selected.filter((s) => s !== option) : [...selected, option],
    );
  };

  const groupId = useId();

  return (
    <div className="field">
      {/* Not a <label> — a group of buttons has no single control to point at. */}
      <span className="field-group-label" id={groupId}>
        {label}
      </span>
      <div className="chip-row" role="group" aria-labelledby={groupId}>
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              className={`chip ${isSelected ? 'chip-selected' : 'chip-available'}`}
              aria-pressed={isSelected}
              onClick={() => toggle(option)}
            >
              <span>{option}</span>
              <span aria-hidden="true">{isSelected ? '✕' : '+'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

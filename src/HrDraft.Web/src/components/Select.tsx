import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { dropIn, unfurl } from '../lib/motion';
import type { LookupOption } from '../types/domain';

function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  return ref;
}

export interface SelectProps {
  label: string;
  options: LookupOption[];
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Listbox-style select. Native <select> can't carry the design's group headers,
 * check marks and disabled-with-reason options, so this is a custom control —
 * with the full keyboard contract a native one would have given us free.
 */
export function Select({
  label,
  options,
  value,
  onChange,
  helper,
  error,
  disabled = false,
  placeholder = 'Select…',
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();
  const labelId = useId();
  const ref = useDismiss(open, () => setOpen(false));

  const selectable = useMemo(() => options.filter((o) => o.isEnabled), [options]);
  const selected = options.find((o) => o.value === value);

  // Grouped rendering, preserving the incoming order within each group.
  const groups = useMemo(() => {
    const map = new Map<string, LookupOption[]>();
    for (const opt of options) {
      const key = opt.group ?? '';
      const bucket = map.get(key);
      if (bucket) bucket.push(opt);
      else map.set(key, [opt]);
    }
    return [...map.entries()];
  }, [options]);

  const commit = (opt: LookupOption) => {
    if (!opt.isEnabled) return;
    onChange(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (disabled) return;

    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(Math.max(0, selectable.findIndex((o) => o.value === value)));
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(selectable.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const opt = selectable[activeIndex];
      if (opt) commit(opt);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className="field select-field" ref={ref}>
      <span className="field-group-label" id={labelId}>
        {label}
      </span>

      <button
        type="button"
        className={`input select-trigger${error ? ' input-error' : ''}`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        aria-controls={open ? listId : undefined}
        aria-invalid={error ? true : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
      >
        <span className={selected ? '' : 'text-muted'}>{selected?.label ?? placeholder}</span>
        <span className={open ? 'select-caret-open' : 'text-muted'} aria-hidden="true">
          {open ? '▴' : '▾'}
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="select-panel overlay-surface"
            id={listId}
            role="listbox"
            tabIndex={-1}
            variants={dropIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {groups.map(([groupName, groupOptions]) => (
              <div key={groupName || 'ungrouped'}>
                {groupName ? <div className="option-group-label">{groupName}</div> : null}
                {groupOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  const isActive = selectable[activeIndex]?.value === opt.value;
                  return (
                    <div
                      key={opt.value}
                      className={`option${isActive ? ' option-active' : ''}`}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={!opt.isEnabled || undefined}
                      onClick={() => commit(opt)}
                    >
                      <span>{opt.label}</span>
                      {isSelected ? (
                        <span className="option-check" aria-hidden="true">
                          ✓
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : helper ? (
        <span className="field-helper">{helper}</span>
      ) : null}
    </div>
  );
}

export interface TypeaheadProps {
  label: string;
  /** The full candidate list; filtering happens client-side. */
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Noun for the result footer, e.g. "teams" → "2 of 14 teams". */
  noun: string;
  maxVisible?: number;
}

/** Filtering combobox with the matched substring emphasised in each result. */
export function Typeahead({
  label,
  options,
  value,
  onChange,
  placeholder,
  noun,
  maxVisible = 6,
}: TypeaheadProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const listId = useId();
  const ref = useDismiss(open, () => setOpen(false));

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  const visible = matches.slice(0, maxVisible);

  const commit = (option: string) => {
    onChange(option);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="field select-field" ref={ref}>
      <label htmlFor={inputId}>{label}</label>
      <div className="typeahead-control">
        <input
          id={inputId}
          className="input"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          placeholder={placeholder}
          value={open ? query : value}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
            if (e.key === 'Enter' && visible[0]) {
              e.preventDefault();
              commit(visible[0]);
            }
          }}
        />
        {value && !open ? (
          <button
            type="button"
            className="typeahead-clear"
            aria-label={`Clear ${label}`}
            onClick={() => onChange('')}
          >
            <span aria-hidden="true">✕</span>
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="typeahead-panel overlay-surface"
            id={listId}
            role="listbox"
            variants={unfurl}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {visible.map((option) => (
              <div
                key={option}
                className="option"
                role="option"
                aria-selected={option === value}
                onClick={() => commit(option)}
              >
                <span>{highlight(option, query)}</span>
              </div>
            ))}
            <div className="option-footer">
              {matches.length === options.length
                ? `${options.length} ${noun}`
                : `${matches.length} of ${options.length} ${noun}`}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Wraps the matched substring so it can be emphasised without dangerouslySetInnerHTML. */
function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const at = text.toLowerCase().indexOf(q.toLowerCase());
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="option-match">{text.slice(at, at + q.length)}</span>
      {text.slice(at + q.length)}
    </>
  );
}

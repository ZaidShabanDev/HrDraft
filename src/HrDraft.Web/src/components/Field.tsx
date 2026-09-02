import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

interface FieldShellProps {
  label: string;
  helper?: string;
  error?: string;
  /** Right-aligned counter, e.g. "54 / 400". */
  counter?: string;
  children: (ids: { inputId: string; describedBy: string | undefined }) => ReactNode;
}

/**
 * Label + control + one of (error | helper) + optional counter.
 * Error replaces helper rather than stacking — the design shows one message slot.
 */
export function Field({ label, helper, error, counter, children }: FieldShellProps) {
  const inputId = useId();
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const describedBy = error ? errorId : helper ? helperId : undefined;

  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      {children({ inputId, describedBy })}
      {error ? (
        <span className="field-error" id={errorId} role="alert">
          {error}
        </span>
      ) : helper ? (
        <span className="field-helper" id={helperId}>
          {helper}
        </span>
      ) : null}
      {counter ? <span className="field-counter">{counter}</span> : null}
    </div>
  );
}

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'id' | 'aria-describedby' | 'aria-invalid'
>;

export interface TextFieldProps extends NativeInputProps {
  label: string;
  helper?: string;
  error?: string;
}

export function TextField({ label, helper, error, ...rest }: TextFieldProps) {
  return (
    <Field
      label={label}
      {...(helper === undefined ? {} : { helper })}
      {...(error === undefined ? {} : { error })}
    >
      {({ inputId, describedBy }) => (
        <input
          {...rest}
          id={inputId}
          className={`input${error ? ' input-error' : ''}`}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
        />
      )}
    </Field>
  );
}

type NativeTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className' | 'id' | 'aria-describedby' | 'aria-invalid'
>;

export interface TextAreaFieldProps extends NativeTextareaProps {
  label: string;
  helper?: string;
  error?: string;
  /** Locks the resize handle — used where the design fixes the row count.
   *  `maxLength` is inherited, and supplying it also shows a "used / max" counter. */
  fixedSize?: boolean;
}

export function TextAreaField({
  label,
  helper,
  error,
  maxLength,
  fixedSize = false,
  value,
  ...rest
}: TextAreaFieldProps) {
  const used = typeof value === 'string' ? value.length : 0;
  const counter = maxLength === undefined ? undefined : `${used} / ${maxLength}`;

  return (
    <Field
      label={label}
      {...(helper === undefined ? {} : { helper })}
      {...(error === undefined ? {} : { error })}
      {...(counter === undefined ? {} : { counter })}
    >
      {({ inputId, describedBy }) => (
        <textarea
          {...rest}
          value={value}
          id={inputId}
          maxLength={maxLength}
          className={`input${fixedSize ? ' input-fixed' : ''}${error ? ' input-error' : ''}`}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
        />
      )}
    </Field>
  );
}

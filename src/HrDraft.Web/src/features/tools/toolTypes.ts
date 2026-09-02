import type { ComponentType } from 'react';
import type { ToolCategory } from '../../types/domain';

/** The form's working values. Shape is per-tool; the parent treats it opaquely. */
export type ToolFormValues = Record<string, unknown>;

export interface ToolFormProps {
  value: ToolFormValues;
  onChange: (next: ToolFormValues) => void;
  /** Keyed by field name. Empty when the form is untouched or valid. */
  errors: Record<string, string>;
  disabled: boolean;
}

export interface NextStep {
  label: string;
  /** The tool a child generation is created with. */
  toolKey: string;
}

export interface ToolDefinition {
  /** Matches Tools.ToolKey in the database. */
  toolKey: string;
  displayNumber: string;
  title: string;
  blurb: string;
  /** Shorter blurb for the phone list rows, where width is tight. */
  shortBlurb: string;
  category: ToolCategory;
  estimatedSeconds: number;
  /** Derives the history/draft title from the submitted inputs. */
  deriveTitle: (values: ToolFormValues) => string;
  /** Returns a message per invalid field; empty object means valid. */
  validate: (values: ToolFormValues) => Record<string, string>;
  defaultValues: ToolFormValues;
  FormComponent: ComponentType<ToolFormProps>;
  nextSteps?: NextStep[];
  /** Shows the human-review banner on the result. */
  requiresHumanReview: boolean;
}

export function requiredText(
  values: ToolFormValues,
  field: string,
  message: string,
): Record<string, string> {
  const raw = values[field];
  const empty = typeof raw !== 'string' || raw.trim().length === 0;
  return empty ? { [field]: message } : {};
}

export function str(values: ToolFormValues, field: string): string {
  const raw = values[field];
  return typeof raw === 'string' ? raw : '';
}

export function strArray(values: ToolFormValues, field: string): string[] {
  const raw = values[field];
  return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string') : [];
}

export function bool(values: ToolFormValues, field: string): boolean {
  return values[field] === true;
}

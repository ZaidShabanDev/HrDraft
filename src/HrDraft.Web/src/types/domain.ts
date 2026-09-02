/**
 * Domain types. These mirror the database schema so the Phase 2 API swap is a
 * change of data source, not of shape.
 * Schema: docs/HR_Tools_App/notes/database-schema.md
 */

export type ToolCategory = 'Recruiting' | 'Onboarding';

export type GenerationStatus = 'Pending' | 'Succeeded' | 'Failed';

export type UserRole = 'HrUser' | 'HrAdmin';

export interface CurrentUser {
  userId: number;
  email: string;
  displayName: string;
  initials: string;
  role: UserRole;
  generationsToday: number;
  dailyGenerationLimit: number;
}

export interface CompBand {
  compBandId: number;
  levelCode: string;
  minAmount: number | null;
  maxAmount: number | null;
  currencyCode: string | null;
  bonusPercent: number | null;
  displayOverride: string | null;
  sortOrder: number;
}

export interface CompanyProfile {
  companyProfileId: number;
  companyName: string;
  benefitsBlurb: string;
  deiStatement: string;
  cultureDescription: string;
  compBands: CompBand[];
  updatedByName: string;
  updatedUtc: string;
}

/** One row of the generator form's "pulled from company profile" rail. */
export interface ProfileContribution {
  key: string;
  label: string;
  inUse: boolean;
}

export interface Team {
  teamId: number;
  name: string;
}

export interface LookupOption {
  value: string;
  label: string;
  isEnabled: boolean;
  group?: string;
}

export interface GenerationRevision {
  generationRevisionId: number;
  versionNumber: number;
  isModelOutput: boolean;
  createdByName: string;
  createdUtc: string;
}

export interface GenerationSummary {
  generationId: number;
  title: string;
  toolKey: string;
  toolName: string;
  createdUtc: string;
  createdByName: string;
  isReviewed: boolean;
}

export interface Generation extends GenerationSummary {
  status: GenerationStatus;
  inputs: Record<string, unknown>;
  outputMarkdown: string | null;
  editedMarkdown: string | null;
  errorMessage: string | null;
  parentGenerationId: number | null;
  revisions: GenerationRevision[];
  profileContributions: ProfileContribution[];
}

/** Server-sent event contract for streamed generation. Phase 2 wires this up;
 *  the shape is fixed now so the client doesn't need reworking. */
export type GenerationEvent =
  | { type: 'started'; generationId: number }
  | { type: 'delta'; text: string }
  | { type: 'done'; generation: Generation }
  | { type: 'error'; message: string; retryable: boolean };

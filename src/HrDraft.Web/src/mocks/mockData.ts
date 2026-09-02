/**
 * Every fixture from the design sketch, in one file.
 *
 * This is the seam between the UI and the backend: Phase 2 deletes this file and
 * points src/api/ at real endpoints. No screen should need to change.
 */

import type {
  CompanyProfile,
  CurrentUser,
  Generation,
  GenerationSummary,
  LookupOption,
  ProfileContribution,
} from '../types/domain';

export const mockCurrentUser: CurrentUser = {
  userId: 1,
  email: 'anna.m@example.com',
  displayName: 'Anna Meyer',
  initials: 'AM',
  role: 'HrAdmin',
  generationsToday: 12,
  dailyGenerationLimit: 20,
};

export const mockCompanyProfile: CompanyProfile = {
  companyProfileId: 3,
  companyName: 'Your Company',
  benefitsBlurb: '30 days leave, €1,200 learning budget, hybrid by default.',
  deiStatement: 'We hire on evidence of capability, not pedigree…',
  cultureDescription: '',
  compBands: [
    {
      compBandId: 1,
      levelCode: 'L3',
      minAmount: 55000,
      maxAmount: 68000,
      currencyCode: 'EUR',
      bonusPercent: 5,
      displayOverride: null,
      sortOrder: 1,
    },
    {
      compBandId: 2,
      levelCode: 'L4',
      minAmount: 68000,
      maxAmount: 85000,
      currencyCode: 'EUR',
      bonusPercent: 8,
      displayOverride: null,
      sortOrder: 2,
    },
    {
      compBandId: 3,
      levelCode: 'L5',
      minAmount: 85000,
      maxAmount: 105000,
      currencyCode: 'EUR',
      bonusPercent: 10,
      displayOverride: null,
      sortOrder: 3,
    },
  ],
  updatedByName: 'Anna',
  updatedUtc: '2026-08-22T09:14:00Z',
};

export const mockProfileContributions: ProfileContribution[] = [
  { key: 'benefits', label: 'Benefits blurb', inUse: true },
  { key: 'dei', label: 'DEI statement', inUse: true },
  { key: 'comp-l5', label: 'Comp band L5', inUse: true },
  { key: 'culture', label: 'Culture description', inUse: false },
];

/** 14 teams, so the typeahead footer reads "2 of 14 teams" when filtered to "eng". */
export const mockTeams: string[] = [
  'Engineering — Platform',
  'Engineering — Data',
  'Product',
  'Design',
  'People & Culture',
  'Finance',
  'Legal',
  'Sales — DACH',
  'Sales — Benelux',
  'Customer Success',
  'Marketing',
  'Supply Chain Operations',
  'Warehouse Systems',
  'IT & Security',
];

export const mockWorkArrangements: LookupOption[] = [
  { value: 'onsite-munich', label: 'On-site — Munich', isEnabled: true, group: 'Arrangement' },
  {
    value: 'hybrid-munich-3',
    label: 'Hybrid — 3 days Munich',
    isEnabled: true,
    group: 'Arrangement',
  },
  { value: 'remote-eu', label: 'Remote — EU', isEnabled: true, group: 'Arrangement' },
  {
    value: 'remote-global',
    label: 'Remote — global (policy blocked)',
    isEnabled: false,
    group: 'Arrangement',
  },
];

export const mockSeniorityOptions = [
  { value: 'junior', label: 'Junior', shortLabel: 'Jr' },
  { value: 'mid', label: 'Mid', shortLabel: 'Mid' },
  { value: 'senior', label: 'Senior', shortLabel: 'Snr' },
  { value: 'lead', label: 'Lead', shortLabel: 'Lead' },
];

export const mockInterviewTypes: LookupOption[] = [
  { value: 'behavioral', label: 'Behavioral', isEnabled: true },
  { value: 'technical', label: 'Technical', isEnabled: true },
  { value: 'culture', label: 'Culture add', isEnabled: true },
];

export const mockSkillSuggestions: string[] = [
  'Go',
  'Node',
  'SQL Server',
  'Kubernetes',
  'Kafka',
  'Terraform',
  'German',
  'Fintech domain',
];

const DRAFT_MARKDOWN = `# Senior Backend Engineer — Platform

You will own the services that move money between our ledger and the banks we work with. The Platform team is six engineers; you would be the third senior, pairing closely with infrastructure.

## What you'll do

- Design and run payment-critical services in Go on SQL Server.
- Lead the split of the ledger monolith into two bounded services.
- Mentor two mid-level engineers through design review.

## Must have

- 5+ years in Go or Node
- Distributed systems in production
- Strong SQL Server

## Nice to have

- Kubernetes
- Fintech domain
- German

---

**Compensation** — €85,000–105,000 plus the standard bonus. Pulled from comp band L5.
`;

export const mockHistory: GenerationSummary[] = [
  {
    generationId: 41,
    title: 'Senior Backend Engineer',
    toolKey: 'job-description',
    toolName: 'Job description',
    createdUtc: '2026-08-25T14:02:00Z',
    createdByName: 'Anna Meyer',
    isReviewed: false,
  },
  {
    generationId: 40,
    title: 'Platform interview set',
    toolKey: 'interview-questions',
    toolName: 'Interview questions',
    createdUtc: '2026-08-25T11:20:00Z',
    createdByName: 'Anna Meyer',
    isReviewed: true,
  },
  {
    generationId: 38,
    title: 'Ana G. — 30/60/90',
    toolKey: 'plan-30-60-90',
    toolName: 'Onboarding plan',
    createdUtc: '2026-08-21T09:40:00Z',
    createdByName: 'Anna Meyer',
    isReviewed: true,
  },
  {
    generationId: 31,
    title: 'Data Engineer (Senior)',
    toolKey: 'job-description',
    toolName: 'Job description',
    createdUtc: '2026-08-04T15:12:00Z',
    createdByName: 'Jonas Klein',
    isReviewed: true,
  },
  {
    generationId: 27,
    title: 'Welcome — Jonas K.',
    toolKey: 'welcome-email',
    toolName: 'Welcome email',
    createdUtc: '2026-07-29T08:05:00Z',
    createdByName: 'Anna Meyer',
    isReviewed: true,
  },
];

export const mockDraft: Generation = {
  generationId: 41,
  title: 'Senior Backend Engineer',
  toolKey: 'job-description',
  toolName: 'Job description',
  createdUtc: '2026-08-25T14:02:00Z',
  createdByName: 'Anna Meyer',
  isReviewed: false,
  status: 'Succeeded',
  inputs: {
    jobTitle: 'Senior Backend Engineer',
    team: 'Engineering — Platform',
    seniority: 'senior',
    mustHaves: ['Go', 'SQL Server'],
    niceToHaves: ['Kubernetes', 'Fintech domain', 'German'],
    workArrangement: 'hybrid-munich-3',
    includeCompRange: true,
    includeEeoStatement: true,
  },
  outputMarkdown: DRAFT_MARKDOWN,
  editedMarkdown: null,
  errorMessage: null,
  parentGenerationId: null,
  revisions: [
    {
      generationRevisionId: 1,
      versionNumber: 1,
      isModelOutput: true,
      createdByName: 'Generated',
      createdUtc: '2026-08-25T14:02:00Z',
    },
  ],
  profileContributions: mockProfileContributions,
};

/** The generator form's "Reuse a past run" list. */
export const mockRecentRuns = [
  { generationId: 33, label: 'Backend Engineer (Mid) — 12 Aug' },
  { generationId: 31, label: 'Data Engineer (Senior) — 04 Aug' },
];

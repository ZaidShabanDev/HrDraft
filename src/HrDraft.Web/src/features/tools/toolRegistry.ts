import { JobDescriptionForm } from '../generate/forms/JobDescriptionForm';
import {
  InterviewQuestionsForm,
  JdRewriterForm,
  OnboardingChecklistForm,
  Plan306090Form,
  ScorecardForm,
  WelcomeEmailForm,
} from '../generate/forms/OtherToolForms';
import { requiredText, str, type ToolDefinition } from './toolTypes';

/**
 * One entry per tool. Mirrors the Tools table: the database owns whether a tool
 * is live and its token cap; this registry owns what its form looks like.
 *
 * Adding a tool is one entry here plus one form component — never a change to
 * the shell, the router, or the home grid.
 */
export const TOOLS: ToolDefinition[] = [
  {
    toolKey: 'job-description',
    displayNumber: '01',
    title: 'Job description',
    blurb: 'Title, seniority, must-haves → full JD with comp and inclusive closing.',
    shortBlurb: 'Title, seniority, must-haves → full JD.',
    category: 'Recruiting',
    estimatedSeconds: 20,
    requiresHumanReview: true,
    deriveTitle: (v) => str(v, 'jobTitle') || 'Untitled job description',
    validate: (v) => requiredText(v, 'jobTitle', 'Job title is required.'),
    defaultValues: {
      jobTitle: '',
      team: '',
      seniority: 'mid',
      mustHaves: [],
      niceToHaves: [],
      workArrangement: 'hybrid-munich-3',
      includeCompRange: true,
      includeEeoStatement: true,
    },
    FormComponent: JobDescriptionForm,
    nextSteps: [
      { label: 'Interview questions from this JD', toolKey: 'interview-questions' },
      { label: 'Scorecard from this JD', toolKey: 'scorecard' },
    ],
  },
  {
    toolKey: 'jd-rewriter',
    displayNumber: '02',
    title: 'JD rewriter',
    blurb: 'Paste an old posting → debiased, restructured, inclusive.',
    shortBlurb: 'Paste an old posting → debiased.',
    category: 'Recruiting',
    estimatedSeconds: 25,
    requiresHumanReview: true,
    deriveTitle: (v) => {
      const first = str(v, 'existingJd').split('\n')[0]?.trim() ?? '';
      return first.slice(0, 80) || 'Rewritten posting';
    },
    validate: (v) => requiredText(v, 'existingJd', 'Paste the posting you want rewritten.'),
    defaultValues: { existingJd: '', keepStructure: false },
    FormComponent: JdRewriterForm,
  },
  {
    toolKey: 'interview-questions',
    displayNumber: '03',
    title: 'Interview questions',
    blurb: 'Competency set by interview type, with follow-ups.',
    shortBlurb: 'Competency set with follow-ups.',
    category: 'Recruiting',
    estimatedSeconds: 20,
    requiresHumanReview: false,
    deriveTitle: (v) => {
      const role = str(v, 'role');
      return role ? `${role} interview set` : 'Interview set';
    },
    validate: (v) => requiredText(v, 'role', 'Role is required.'),
    defaultValues: {
      role: '',
      seniority: 'mid',
      interviewType: 'behavioral',
      competencies: [],
    },
    FormComponent: InterviewQuestionsForm,
    nextSteps: [{ label: 'Scorecard from this question set', toolKey: 'scorecard' }],
  },
  {
    toolKey: 'scorecard',
    displayNumber: '04',
    title: 'Scorecard',
    blurb: 'Rating grid with strong / weak answer guidance.',
    shortBlurb: 'Rating grid with answer guidance.',
    category: 'Recruiting',
    estimatedSeconds: 18,
    requiresHumanReview: false,
    deriveTitle: (v) => {
      const role = str(v, 'role');
      return role ? `${role} scorecard` : 'Scorecard';
    },
    validate: (v) => requiredText(v, 'role', 'Role is required.'),
    defaultValues: { role: '', competencies: [], includeAnswerGuidance: true },
    FormComponent: ScorecardForm,
  },
  {
    toolKey: 'plan-30-60-90',
    displayNumber: '05',
    title: '30/60/90 plan',
    blurb: 'Phased milestones by role, manager and goals.',
    shortBlurb: 'Phased milestones by role and goals.',
    category: 'Onboarding',
    estimatedSeconds: 25,
    requiresHumanReview: false,
    deriveTitle: (v) => {
      const role = str(v, 'role');
      return role ? `${role} — 30/60/90` : '30/60/90 plan';
    },
    validate: (v) => requiredText(v, 'role', 'Role is required.'),
    defaultValues: { role: '', manager: '', team: '', goals: '' },
    FormComponent: Plan306090Form,
  },
  {
    toolKey: 'onboarding-checklist',
    displayNumber: '06',
    title: 'Onboarding checklist',
    blurb: 'Week-by-week, systems and equipment included.',
    shortBlurb: 'Week-by-week, systems included.',
    category: 'Onboarding',
    estimatedSeconds: 20,
    requiresHumanReview: false,
    deriveTitle: (v) => {
      const name = str(v, 'hireName');
      return name ? `${name} — onboarding` : 'Onboarding checklist';
    },
    validate: (v) => ({
      ...requiredText(v, 'hireName', 'New hire name is required.'),
      ...requiredText(v, 'startDate', 'Start date is required.'),
    }),
    defaultValues: { hireName: '', startDate: '', department: '', systems: [] },
    FormComponent: OnboardingChecklistForm,
  },
  {
    toolKey: 'welcome-email',
    displayNumber: '07',
    title: 'Welcome email',
    blurb: 'First-day message for the team and the new hire.',
    shortBlurb: 'First-day message for the new hire.',
    category: 'Onboarding',
    estimatedSeconds: 12,
    requiresHumanReview: false,
    deriveTitle: (v) => {
      const name = str(v, 'hireName');
      return name ? `Welcome — ${name}` : 'Welcome email';
    },
    validate: (v) => requiredText(v, 'hireName', 'New hire name is required.'),
    defaultValues: {
      hireName: '',
      role: '',
      team: '',
      startDate: '',
      mentions: [],
      copyMe: false,
    },
    FormComponent: WelcomeEmailForm,
  },
];

export function getTool(toolKey: string | undefined): ToolDefinition | undefined {
  return TOOLS.find((t) => t.toolKey === toolKey);
}

export function toolsByCategory(category: ToolDefinition['category']): ToolDefinition[] {
  return TOOLS.filter((t) => t.category === category);
}

export const TOOL_CATEGORIES = ['Recruiting', 'Onboarding'] as const;

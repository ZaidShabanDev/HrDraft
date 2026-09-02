/**
 * The remaining six tool forms. Grouped in one file because each is small and
 * they share the same imports; split them out if any grows past ~40 lines.
 */

import {
  ChipInput,
  SegmentedControl,
  Select,
  TextAreaField,
  TextField,
  Toggle,
  Typeahead,
} from '../../../components';
import { useIsPhone } from '../../../hooks/useBreakpoint';
import {
  mockInterviewTypes,
  mockSeniorityOptions,
  mockSkillSuggestions,
  mockTeams,
} from '../../../mocks/mockData';
import { bool, str, strArray, type ToolFormProps } from '../../tools/toolTypes';

const COMPETENCIES = [
  'Systems design',
  'Debugging',
  'Ownership',
  'Collaboration',
  'Mentoring',
  'Communication',
  'Delivery',
];

export function JdRewriterForm({ value, onChange, errors, disabled }: ToolFormProps) {
  const set = (patch: Record<string, unknown>) => onChange({ ...value, ...patch });

  return (
    <>
      {/* Pasted text is treated strictly as material to rewrite — the server
          fences it so it can't act as instructions. */}
      <TextAreaField
        label="Paste the existing posting"
        value={str(value, 'existingJd')}
        rows={12}
        maxLength={12000}
        disabled={disabled}
        {...(errors['existingJd'] ? { error: errors['existingJd'] } : {})}
        onChange={(e) => set({ existingJd: e.target.value })}
      />
      <Toggle
        label="Keep the original structure"
        checked={bool(value, 'keepStructure')}
        disabled={disabled}
        onChange={(keepStructure) => set({ keepStructure })}
      />
    </>
  );
}

export function InterviewQuestionsForm({ value, onChange, errors, disabled }: ToolFormProps) {
  const isPhone = useIsPhone();
  const set = (patch: Record<string, unknown>) => onChange({ ...value, ...patch });

  return (
    <>
      <div className="form-row">
        <TextField
          label="Role"
          value={str(value, 'role')}
          disabled={disabled}
          {...(errors['role'] ? { error: errors['role'] } : {})}
          onChange={(e) => set({ role: e.target.value })}
        />
        <Select
          label="Interview type"
          options={mockInterviewTypes}
          value={str(value, 'interviewType')}
          disabled={disabled}
          onChange={(interviewType) => set({ interviewType })}
        />
      </div>
      <SegmentedControl
        label="Seniority"
        options={mockSeniorityOptions}
        value={str(value, 'seniority')}
        abbreviated={isPhone}
        fullWidth={isPhone}
        disabled={disabled}
        onChange={(seniority) => set({ seniority })}
      />
      <ChipInput
        label="Competencies"
        options={COMPETENCIES}
        selected={strArray(value, 'competencies')}
        onChange={(competencies) => set({ competencies })}
      />
    </>
  );
}

export function ScorecardForm({ value, onChange, errors, disabled }: ToolFormProps) {
  const set = (patch: Record<string, unknown>) => onChange({ ...value, ...patch });

  return (
    <>
      <TextField
        label="Role"
        value={str(value, 'role')}
        disabled={disabled}
        {...(errors['role'] ? { error: errors['role'] } : {})}
        onChange={(e) => set({ role: e.target.value })}
      />
      <ChipInput
        label="Competencies to rate"
        options={COMPETENCIES}
        selected={strArray(value, 'competencies')}
        onChange={(competencies) => set({ competencies })}
      />
      <Toggle
        label="Include strong / weak answer examples"
        checked={bool(value, 'includeAnswerGuidance')}
        disabled={disabled}
        onChange={(includeAnswerGuidance) => set({ includeAnswerGuidance })}
      />
    </>
  );
}

export function Plan306090Form({ value, onChange, errors, disabled }: ToolFormProps) {
  const set = (patch: Record<string, unknown>) => onChange({ ...value, ...patch });

  return (
    <>
      <div className="form-row">
        <TextField
          label="Role"
          value={str(value, 'role')}
          disabled={disabled}
          {...(errors['role'] ? { error: errors['role'] } : {})}
          onChange={(e) => set({ role: e.target.value })}
        />
        <TextField
          label="Manager"
          value={str(value, 'manager')}
          disabled={disabled}
          onChange={(e) => set({ manager: e.target.value })}
        />
      </div>
      <Typeahead
        label="Team"
        noun="teams"
        options={mockTeams}
        value={str(value, 'team')}
        onChange={(team) => set({ team })}
      />
      <TextAreaField
        label="Key goals and stakeholders"
        value={str(value, 'goals')}
        rows={4}
        maxLength={1200}
        fixedSize
        disabled={disabled}
        onChange={(e) => set({ goals: e.target.value })}
      />
    </>
  );
}

export function OnboardingChecklistForm({ value, onChange, errors, disabled }: ToolFormProps) {
  const set = (patch: Record<string, unknown>) => onChange({ ...value, ...patch });

  return (
    <>
      <div className="form-row">
        <TextField
          label="New hire name"
          value={str(value, 'hireName')}
          disabled={disabled}
          {...(errors['hireName'] ? { error: errors['hireName'] } : {})}
          onChange={(e) => set({ hireName: e.target.value })}
        />
        <TextField
          label="Start date"
          type="date"
          value={str(value, 'startDate')}
          disabled={disabled}
          {...(errors['startDate'] ? { error: errors['startDate'] } : {})}
          onChange={(e) => set({ startDate: e.target.value })}
        />
      </div>
      <Typeahead
        label="Department"
        noun="teams"
        options={mockTeams}
        value={str(value, 'department')}
        onChange={(department) => set({ department })}
      />
      <ChipInput
        label="Systems and equipment"
        options={[
          'Laptop',
          'Monitor',
          'Phone',
          'Email',
          'VPN',
          'SQL Server access',
          'Badge',
          'Payroll',
        ]}
        selected={strArray(value, 'systems')}
        onChange={(systems) => set({ systems })}
      />
    </>
  );
}

export function WelcomeEmailForm({ value, onChange, errors, disabled }: ToolFormProps) {
  const set = (patch: Record<string, unknown>) => onChange({ ...value, ...patch });

  return (
    <>
      <div className="form-row">
        <TextField
          label="New hire name"
          value={str(value, 'hireName')}
          disabled={disabled}
          {...(errors['hireName'] ? { error: errors['hireName'] } : {})}
          onChange={(e) => set({ hireName: e.target.value })}
        />
        <TextField
          label="Role"
          value={str(value, 'role')}
          disabled={disabled}
          onChange={(e) => set({ role: e.target.value })}
        />
      </div>
      <div className="form-row">
        <Typeahead
          label="Team"
          noun="teams"
          options={mockTeams}
          value={str(value, 'team')}
          onChange={(team) => set({ team })}
        />
        <TextField
          label="Start date"
          type="date"
          value={str(value, 'startDate')}
          disabled={disabled}
          onChange={(e) => set({ startDate: e.target.value })}
        />
      </div>
      <ChipInput
        label="Mention in the message"
        options={mockSkillSuggestions.slice(0, 4).concat(['First-day agenda', 'Buddy', 'Lunch'])}
        selected={strArray(value, 'mentions')}
        onChange={(mentions) => set({ mentions })}
      />
      <Toggle
        label="Email me a copy"
        checked={bool(value, 'copyMe')}
        disabled={disabled}
        onChange={(copyMe) => set({ copyMe })}
      />
    </>
  );
}

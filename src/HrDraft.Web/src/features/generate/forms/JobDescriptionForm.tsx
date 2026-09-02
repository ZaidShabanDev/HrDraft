import { ChipInput, SegmentedControl, Select, TextField, Typeahead, Checkbox } from '../../../components';
import { useIsPhone } from '../../../hooks/useBreakpoint';
import {
  mockSeniorityOptions,
  mockSkillSuggestions,
  mockTeams,
  mockWorkArrangements,
} from '../../../mocks/mockData';
import { bool, str, strArray, type ToolFormProps } from '../../tools/toolTypes';

/**
 * The reference form — this is the one drawn in artboard 1a screen 02, and the
 * shape every other tool form follows.
 */
export function JobDescriptionForm({ value, onChange, errors, disabled }: ToolFormProps) {
  const isPhone = useIsPhone();
  const set = (patch: Record<string, unknown>) => onChange({ ...value, ...patch });

  return (
    <>
      <div className="form-row">
        <TextField
          label="Job title"
          value={str(value, 'jobTitle')}
          disabled={disabled}
          {...(errors['jobTitle'] ? { error: errors['jobTitle'] } : {})}
          onChange={(e) => set({ jobTitle: e.target.value })}
        />
        <Typeahead
          label="Team"
          noun="teams"
          options={mockTeams}
          value={str(value, 'team')}
          placeholder="Start typing a team…"
          onChange={(team) => set({ team })}
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
        label="Must-haves"
        options={mockSkillSuggestions}
        selected={strArray(value, 'mustHaves')}
        onChange={(mustHaves) => set({ mustHaves })}
      />

      <ChipInput
        label="Nice-to-haves"
        options={mockSkillSuggestions}
        selected={strArray(value, 'niceToHaves')}
        onChange={(niceToHaves) => set({ niceToHaves })}
      />

      <div className="form-row">
        {/* Comp comes from the profile's comp bands, so it is shown, not asked. */}
        <TextField
          label="Compensation range"
          value="Auto — from comp bands (L5)"
          helper="Comes from company profile."
          readOnly
          disabled
          onChange={() => undefined}
        />
        <Select
          label="Work arrangement"
          options={mockWorkArrangements}
          value={str(value, 'workArrangement')}
          disabled={disabled}
          onChange={(workArrangement) => set({ workArrangement })}
        />
      </div>

      <div className="checkbox-row">
        <Checkbox
          label="Include comp range"
          checked={bool(value, 'includeCompRange')}
          disabled={disabled}
          onChange={(includeCompRange) => set({ includeCompRange })}
        />
        <Checkbox
          label="Include EEO statement"
          checked={bool(value, 'includeEeoStatement')}
          disabled={disabled}
          onChange={(includeEeoStatement) => set({ includeEeoStatement })}
        />
      </div>
    </>
  );
}

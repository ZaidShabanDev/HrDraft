import { useState } from 'react';
import {
  Button,
  DataTable,
  Panel,
  PanelHeader,
  StackedRow,
  Stack,
  Tag,
  TextAreaField,
  TextField,
  useToast,
} from '../../components';
import type { Column } from '../../components';
import { useIsPhone } from '../../hooks/useBreakpoint';
import { mockCompanyProfile } from '../../mocks/mockData';
import type { CompBand } from '../../types/domain';
import './profile.css';

function formatRange(band: CompBand): string {
  if (band.displayOverride) return band.displayOverride;
  if (band.minAmount === null || band.maxAmount === null) return '—';
  const thousands = (n: number) => `${Math.round(n / 1000)}k`;
  const symbol = band.currencyCode === 'EUR' ? '€' : `${band.currencyCode ?? ''} `;
  return `${symbol}${thousands(band.minAmount)}–${thousands(band.maxAmount)}`;
}

export function CompanyProfilePage() {
  const toast = useToast();
  const isPhone = useIsPhone();
  const [profile, setProfile] = useState(mockCompanyProfile);

  const columns: Column<CompBand>[] = [
    { key: 'level', header: 'Level', render: (b) => b.levelCode },
    { key: 'range', header: 'Range', render: formatRange },
    {
      key: 'bonus',
      header: 'Bonus',
      render: (b) => (b.bonusPercent === null ? '—' : `${b.bonusPercent}%`),
    },
  ];

  const lastEdited = new Date(profile.updatedUtc).toLocaleDateString();

  return (
    <div className="page-pad">
      <div className="profile-page">
        <Panel accentTop>
          <PanelHeader title="Company profile" trailing={<Tag tone="neutral">One-time setup</Tag>} />
          <div className="panel-body">
            <Stack gap={5}>
              <p className="text-muted profile-lede">
                Written once. Every generation reads from here, so output sounds like{' '}
                {profile.companyName} and not like generic AI text.
              </p>

              {/* Two columns from 1280px up: the wide space goes to putting the
                  comp bands beside the prose rather than stretching textareas
                  to a measure nobody can comfortably write in. */}
              <div className="profile-columns">
                <Stack gap={5} className="profile-fields">
                  <TextField
                    label="Company name"
                    value={profile.companyName}
                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  />

                  <TextAreaField
                    label="Benefits blurb"
                    value={profile.benefitsBlurb}
                    rows={3}
                    maxLength={600}
                    fixedSize
                    onChange={(e) => setProfile({ ...profile, benefitsBlurb: e.target.value })}
                  />

                  <TextAreaField
                    label="DEI statement"
                    value={profile.deiStatement}
                    rows={3}
                    maxLength={600}
                    fixedSize
                    onChange={(e) => setProfile({ ...profile, deiStatement: e.target.value })}
                  />

                  <TextAreaField
                    label="Culture description"
                    value={profile.cultureDescription}
                    rows={3}
                    maxLength={900}
                    fixedSize
                    helper="Optional. Adds team texture to job descriptions."
                    onChange={(e) => setProfile({ ...profile, cultureDescription: e.target.value })}
                  />
                </Stack>

                <div className="profile-bands">
                  <h6 className="profile-bands-heading">Comp bands</h6>
                  <DataTable
                    caption="Compensation bands by level"
                    columns={columns}
                    rows={profile.compBands}
                    rowKey={(b) => b.compBandId}
                    renderStackedRow={(b) => (
                      <StackedRow
                        title={b.levelCode}
                        meta={`${formatRange(b)} · ${b.bonusPercent ?? 0}% bonus`}
                      />
                    )}
                  />
                  <p className="text-muted profile-bands-note">
                    Job descriptions pull the band matching the role&rsquo;s seniority.
                  </p>
                </div>
              </div>

              <div className="profile-save">
                <Button
                  variant="primary"
                  onClick={() =>
                    toast.show({ message: 'Profile saved as a new version.', tone: 'success' })
                  }
                >
                  Save profile
                </Button>
                {!isPhone ? (
                  <span className="text-muted profile-save-meta">
                    Last edited {lastEdited} by {profile.updatedByName}
                  </span>
                ) : null}
              </div>
            </Stack>
          </div>
        </Panel>
      </div>
    </div>
  );
}

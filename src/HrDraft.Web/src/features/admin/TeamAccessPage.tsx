import { useState } from 'react';
import {
  Button,
  DataTable,
  Panel,
  PanelHeader,
  StackedRow,
  Stack,
  Tag,
  Toggle,
  useToast,
} from '../../components';
import type { Column } from '../../components';
import type { UserRole } from '../../types/domain';
import './access.css';

interface AccessRow {
  userId: number;
  displayName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

/**
 * The Users table is the allowlist, so this screen is how access is granted and
 * revoked. Once Entra lands, deactivating here and disabling the AD account are
 * both effective — the account check happens at login either way.
 */
const SEED: AccessRow[] = [
  {
    userId: 1,
    displayName: 'Anna Meyer',
    email: 'anna.m@example.com',
    role: 'HrAdmin',
    isActive: true,
  },
  {
    userId: 2,
    displayName: 'Jonas Klein',
    email: 'jonas.k@example.com',
    role: 'HrUser',
    isActive: true,
  },
  {
    userId: 3,
    displayName: 'Rana Haddad',
    email: 'rana.h@example.com',
    role: 'HrUser',
    isActive: true,
  },
  {
    userId: 4,
    displayName: 'Tomas Vogel',
    email: 'tomas.v@example.com',
    role: 'HrUser',
    isActive: false,
  },
];

export function TeamAccessPage() {
  const toast = useToast();
  const [rows, setRows] = useState(SEED);

  const toggleActive = (userId: number, isActive: boolean) => {
    setRows((current) => current.map((r) => (r.userId === userId ? { ...r, isActive } : r)));
    toast.show({
      message: isActive ? 'Access restored.' : 'Access revoked.',
      tone: 'success',
    });
  };

  const columns: Column<AccessRow>[] = [
    { key: 'name', header: 'Name', render: (r) => r.displayName },
    { key: 'email', header: 'Email', render: (r) => r.email },
    {
      key: 'role',
      header: 'Role',
      render: (r) => <Tag tone={r.role === 'HrAdmin' ? 'accent' : 'neutral'}>{r.role === 'HrAdmin' ? 'Admin' : 'User'}</Tag>,
    },
    {
      key: 'active',
      header: 'Access',
      render: (r) => (
        <Toggle
          label={r.isActive ? 'Active' : 'Revoked'}
          checked={r.isActive}
          onChange={(next) => toggleActive(r.userId, next)}
        />
      ),
    },
  ];

  return (
    <div className="page-pad">
      <div className="access-page">
        <Panel accentTop>
          <PanelHeader title="Team access" trailing={<Tag tone="neutral">Admins only</Tag>} />
          <div className="panel-body">
            <Stack gap={4}>
              <p className="text-muted access-lede">
                Only people listed here can sign in. Revoking access takes effect at their next
                sign-in attempt.
              </p>

              <DataTable
                caption="People with access to HR Tools"
                columns={columns}
                rows={rows}
                rowKey={(r) => r.userId}
                renderStackedRow={(r) => (
                  <StackedRow
                    title={r.displayName}
                    meta={`${r.email} · ${r.role === 'HrAdmin' ? 'Admin' : 'User'}`}
                    trailing={
                      <Toggle
                        label={r.isActive ? 'Active' : 'Revoked'}
                        checked={r.isActive}
                        onChange={(next) => toggleActive(r.userId, next)}
                      />
                    }
                  />
                )}
              />

              <Button
                variant="primary"
                onClick={() => toast.show({ message: 'Invites land with the API.', tone: 'success' })}
              >
                Add someone
              </Button>
            </Stack>
          </div>
        </Panel>
      </div>
    </div>
  );
}

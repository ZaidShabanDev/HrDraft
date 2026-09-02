import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  DataTable,
  EmptyState,
  FilterChip,
  IconButton,
  Menu,
  Panel,
  PanelHeader,
  SearchInput,
  SegmentedControl,
  StackedRow,
  Stack,
} from '../../components';
import type { Column, MenuAction, SortDirection } from '../../components';
import { useIsPhone } from '../../hooks/useBreakpoint';
import { mockHistory } from '../../mocks/mockData';
import type { GenerationSummary } from '../../types/domain';
import { TOOLS } from '../tools/toolRegistry';
import './history.css';

type Scope = 'mine' | 'team';

const RANGES = [
  { value: 'all', label: 'All time' },
  { value: '30', label: 'Last 30 days' },
  { value: '7', label: 'Last 7 days' },
];

export function HistoryPage() {
  const navigate = useNavigate();
  const isPhone = useIsPhone();

  const [scope, setScope] = useState<Scope>('mine');
  const [query, setQuery] = useState('');
  const [toolFilter, setToolFilter] = useState<string>('all');
  const [range, setRange] = useState<string>('all');
  const [sortKey, setSortKey] = useState('createdUtc');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [openMenu, setOpenMenu] = useState<'tool' | 'range' | null>(null);
  const [rowMenuFor, setRowMenuFor] = useState<number | null>(null);

  const rows = useMemo(() => {
    const cutoffDays = range === 'all' ? null : Number(range);
    const cutoff = cutoffDays === null ? null : Date.now() - cutoffDays * 86_400_000;

    const filtered = mockHistory.filter((row) => {
      if (scope === 'mine' && row.createdByName !== 'Anna Meyer') return false;
      if (toolFilter !== 'all' && row.toolKey !== toolFilter) return false;
      if (cutoff !== null && new Date(row.createdUtc).getTime() < cutoff) return false;
      if (query.trim() && !row.title.toLowerCase().includes(query.trim().toLowerCase()))
        return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;
      if (sortKey === 'title') return a.title.localeCompare(b.title) * dir;
      if (sortKey === 'toolName') return a.toolName.localeCompare(b.toolName) * dir;
      return (new Date(a.createdUtc).getTime() - new Date(b.createdUtc).getTime()) * dir;
    });
  }, [scope, query, toolFilter, range, sortKey, sortDirection]);

  const onSort = (key: string) => {
    if (key === sortKey) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const rowActions = (row: GenerationSummary): MenuAction[] => [
    {
      id: 'open',
      label: 'Open',
      onSelect: () => navigate(`/tools/${row.toolKey}/result/${row.generationId}`),
    },
    { id: 'duplicate', label: 'Duplicate & riff', onSelect: () => navigate(`/tools/${row.toolKey}`) },
    { id: 'export', label: 'Export .docx', onSelect: () => undefined },
    { id: 'delete', label: 'Delete draft', destructive: true, onSelect: () => undefined },
  ];

  const columns: Column<GenerationSummary>[] = [
    { key: 'title', header: 'Document', sortable: true, render: (r) => r.title },
    { key: 'toolName', header: 'Tool', sortable: true, render: (r) => r.toolName },
    {
      key: 'createdUtc',
      header: 'When',
      sortable: true,
      render: (r) => formatWhen(r.createdUtc),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerHidden: true,
      render: () => <span className="history-open">Open</span>,
    },
  ];

  const toolLabel =
    toolFilter === 'all'
      ? 'Tool: all'
      : `Tool: ${TOOLS.find((t) => t.toolKey === toolFilter)?.title ?? toolFilter}`;

  return (
    <div className="page-pad">
      <div className="history-page">
        <Panel accentTop>
          <PanelHeader
            title="History"
            trailing={
              <SegmentedControl
                label="History scope"
                options={[
                  { value: 'mine', label: 'Mine' },
                  { value: 'team', label: 'Team' },
                ]}
                value={scope}
                onChange={(v) => setScope(v as Scope)}
              />
            }
          />

          <div className="panel-body">
            <Stack gap={4}>
              <div className="toolbar">
                <SearchInput
                  label="Search drafts"
                  value={query}
                  onChange={setQuery}
                  placeholder="Search drafts"
                />

                <span className="history-filter-anchor">
                  <FilterChip
                    label={toolLabel}
                    active={toolFilter !== 'all'}
                    onClick={() => setOpenMenu(openMenu === 'tool' ? null : 'tool')}
                  />
                  <Menu
                    open={openMenu === 'tool'}
                    label="Filter by tool"
                    onClose={() => setOpenMenu(null)}
                    align="left"
                    actions={[
                      { id: 'all', label: 'All tools', onSelect: () => setToolFilter('all') },
                      ...TOOLS.map((t) => ({
                        id: t.toolKey,
                        label: t.title,
                        onSelect: () => setToolFilter(t.toolKey),
                      })),
                    ]}
                  />
                </span>

                <span className="history-filter-anchor">
                  <FilterChip
                    label={RANGES.find((r) => r.value === range)?.label ?? 'All time'}
                    active={range !== 'all'}
                    onClick={() => setOpenMenu(openMenu === 'range' ? null : 'range')}
                  />
                  <Menu
                    open={openMenu === 'range'}
                    label="Filter by date"
                    onClose={() => setOpenMenu(null)}
                    align="left"
                    actions={RANGES.map((r) => ({
                      id: r.value,
                      label: r.label,
                      onSelect: () => setRange(r.value),
                    }))}
                  />
                </span>

                <span className="toolbar-count">
                  {rows.length} {rows.length === 1 ? 'result' : 'results'}
                </span>
              </div>

              <DataTable
                caption="Generated documents"
                columns={columns}
                rows={rows}
                rowKey={(r) => r.generationId}
                onRowClick={(r) => navigate(`/tools/${r.toolKey}/result/${r.generationId}`)}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={onSort}
                emptyState={
                  <EmptyState
                    title="No drafts yet"
                    description="Generated documents land here for you and your team."
                    action={
                      <Button variant="secondary" onClick={() => navigate('/tools/job-description')}>
                        Draft a job description
                      </Button>
                    }
                  />
                }
                renderStackedRow={(row) => (
                  <StackedRow
                    title={row.title}
                    meta={`${row.toolName} · ${formatWhen(row.createdUtc)}`}
                    onClick={() => navigate(`/tools/${row.toolKey}/result/${row.generationId}`)}
                    trailing={
                      <span className="history-row-menu-anchor">
                        <IconButton
                          label={`Actions for ${row.title}`}
                          variant="ghost"
                          aria-haspopup="menu"
                          aria-expanded={rowMenuFor === row.generationId}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRowMenuFor((current) =>
                              current === row.generationId ? null : row.generationId,
                            );
                          }}
                        >
                          <span aria-hidden="true">⋯</span>
                        </IconButton>
                        <Menu
                          open={rowMenuFor === row.generationId}
                          label={`Actions for ${row.title}`}
                          actions={rowActions(row)}
                          onClose={() => setRowMenuFor(null)}
                        />
                      </span>
                    }
                  />
                )}
              />

              {!isPhone && rows.length > 0 ? (
                <div className="history-footer">
                  <Button variant="secondary" onClick={() => navigate('/tools/job-description')}>
                    Duplicate &amp; riff
                  </Button>
                  <span className="text-muted history-footer-note">
                    Audit log keeps who, what, when.
                  </span>
                </div>
              ) : null}
            </Stack>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (sameDay) {
    return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

import { useId } from 'react';
import type { ReactNode } from 'react';
import { useIsPhone } from '../hooks/useBreakpoint';

export interface Column<T> {
  key: string;
  header: string;
  /** Cell content. Keep it to text and small inline marks. */
  render: (row: T) => ReactNode;
  sortable?: boolean;
  /** Suppresses the header text — for a trailing action column. */
  headerHidden?: boolean;
}

export type SortDirection = 'asc' | 'desc';

export interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  selectedKey?: string | number;
  sortKey?: string;
  sortDirection?: SortDirection;
  onSort?: (key: string) => void;
  /** Phone rendering. Required, because a table cannot shrink to 390px. */
  renderStackedRow: (row: T) => ReactNode;
  emptyState?: ReactNode;
}

/**
 * A table at and above 834px; a stacked list below it. The two branches emit
 * different markup rather than different styles, which is why this switch lives
 * in JS instead of a media query.
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  onRowClick,
  selectedKey,
  sortKey,
  sortDirection,
  onSort,
  renderStackedRow,
  emptyState,
}: DataTableProps<T>) {
  const isPhone = useIsPhone();

  if (rows.length === 0 && emptyState) return <>{emptyState}</>;

  if (isPhone) {
    return (
      <div className="stacked-list" role="list" aria-label={caption}>
        {rows.map((row) => (
          <div role="listitem" key={rowKey(row)}>
            {renderStackedRow(row)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="scroll-x">
      <table className="table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((col) => {
              const isSorted = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={
                    isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                >
                  {col.headerHidden ? (
                    <span className="visually-hidden">{col.header}</span>
                  ) : col.sortable && onSort ? (
                    <button type="button" className="table-sort" onClick={() => onSort(col.key)}>
                      {col.header}
                      <span aria-hidden="true">
                        {isSorted ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            return (
              <tr
                key={key}
                aria-selected={selectedKey === key ? true : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'table-row-clickable' : ''}
              >
                {columns.map((col) => (
                  <td key={col.key}>{col.render(row)}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export interface StackedRowProps {
  title: string;
  meta: string;
  onClick?: () => void;
  trailing?: ReactNode;
}

/** The phone stand-in for a table row: title, one meta line, one action. */
export function StackedRow({ title, meta, onClick, trailing }: StackedRowProps) {
  const Element = onClick ? 'button' : 'div';
  return (
    <Element
      className="stacked-row"
      {...(onClick ? { type: 'button' as const, onClick } : {})}
    >
      <span className="stacked-row-main">
        <span className="stacked-row-title">{title}</span>
        <span className="stacked-row-meta">{meta}</span>
      </span>
      {trailing}
    </Element>
  );
}

export interface SearchInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ label, value, onChange, placeholder }: SearchInputProps) {
  const id = useId();
  return (
    <div className="search-input">
      <label className="visually-hidden" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="search"
        className="input"
        value={value}
        placeholder={placeholder ?? label}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="search-input-icon" aria-hidden="true">
        ⌕
      </span>
    </div>
  );
}

export interface FilterChipProps {
  label: string;
  onClick: () => void;
  active?: boolean;
}

/** Opens a filter menu. The label carries the current value, e.g. "Tool: all". */
export function FilterChip({ label, onClick, active = false }: FilterChipProps) {
  return (
    <button
      type="button"
      className={`chip ${active ? 'chip-selected' : 'chip-available'}`}
      aria-haspopup="menu"
      onClick={onClick}
    >
      <span>{label}</span>
      <span aria-hidden="true">▾</span>
    </button>
  );
}

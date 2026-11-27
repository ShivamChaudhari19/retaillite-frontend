import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import type { SortDirection } from '@/shared/hooks/usePagination';

export interface SortOption {
  /** Property name sent to the backend as `sortBy`. */
  value: string;
  label: string;
}

/** Clickable <th>. Clicking asks the backend for a new sort - rows are never re-ordered locally. */
interface SortableThProps {
  field: string;
  label: string;
  sortBy: string;
  orderedBy: SortDirection;
  onSort: (field: string) => void;
  disabled?: boolean;
  align?: 'left' | 'right';
}

export const SortableTh = ({
  field,
  label,
  sortBy,
  orderedBy,
  onSort,
  disabled = false,
  align = 'left',
}: SortableThProps) => {
  const active = sortBy === field;
  const Icon = !active ? ChevronsUpDown : orderedBy === 'asc' ? ArrowUp : ArrowDown;

  return (
    <th
      className={`table-cell font-medium ${align === 'right' ? 'text-right' : ''}`}
      aria-sort={active ? (orderedBy === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        disabled={disabled}
        className={`inline-flex items-center gap-xs font-medium hover:text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          active ? 'text-primary' : ''
        }`}
        title={`Sort by ${label}`}
      >
        {label}
        <Icon className={`w-3 h-3 ${active ? '' : 'opacity-40'}`} />
      </button>
    </th>
  );
};

/** Sort dropdown + direction button for card grids (products, categories). */
interface SortBarProps {
  options: SortOption[];
  sortBy: string;
  orderedBy: SortDirection;
  onChange: (sortBy: string, orderedBy: SortDirection) => void;
}

export const SortBar = ({ options, sortBy, orderedBy, onChange }: SortBarProps) => (
  <div className="flex items-center gap-sm">
    <label className="text-sm text-muted-foreground" htmlFor="sort-field">
      Sort by
    </label>
    <select
      id="sort-field"
      value={sortBy}
      onChange={(e) => onChange(e.target.value, orderedBy)}
      className="input-field w-auto py-xs"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <button
      type="button"
      onClick={() => onChange(sortBy, orderedBy === 'asc' ? 'desc' : 'asc')}
      className="button-secondary inline-flex items-center gap-xs text-sm py-xs px-md"
      title={orderedBy === 'asc' ? 'Ascending - click for descending' : 'Descending - click for ascending'}
    >
      {orderedBy === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
      {orderedBy === 'asc' ? 'Asc' : 'Desc'}
    </button>
  </div>
);

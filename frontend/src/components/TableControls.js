import React from 'react';

/* ── Icons ─────────────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/* ── TableControls ──────────────────────────────────────────────────────── */
/**
 * Toolbar that sits between a panel-header and the <table>.
 *
 * Props:
 *   query / onQueryChange       — text search state
 *   filterValue / onFilterChange — dropdown filter state
 *   filterOptions               — [{ value, label }] | null  (null hides the dropdown)
 *   filtered / total            — for the results counter
 *   isFiltered                  — show "Clear" button
 *   onClearAll                  — reset everything
 *   placeholder                 — search input placeholder
 */
export function TableControls({
  query,
  onQueryChange,
  filterValue,
  onFilterChange,
  filterOptions = null,
  filtered,
  total,
  isFiltered,
  onClearAll,
  placeholder = 'Search…',
}) {
  return (
    <div className="table-controls">
      {/* Left: search + filter */}
      <div className="tc-left">
        <div className="tc-search">
          <span className="tc-search-icon">
            <SearchIcon />
          </span>
          <input
            type="text"
            className="tc-input"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
          />
          {query && (
            <button
              className="tc-clear-x"
              onClick={() => onQueryChange('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {filterOptions && (
          <select
            className="tc-select"
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
            aria-label="Filter"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Right: count + clear */}
      <div className="tc-right">
        {isFiltered && (
          <button className="tc-clear-btn" onClick={onClearAll}>
            Clear filters
          </button>
        )}
        <span className="tc-count" aria-live="polite">
          {isFiltered
            ? `${filtered} of ${total}`
            : `${total} record${total !== 1 ? 's' : ''}`}
        </span>
      </div>
    </div>
  );
}

/* ── SortableTh ─────────────────────────────────────────────────────────── */
/**
 * A <th> that shows a sort direction indicator and calls onSort when clicked.
 *
 * Props:
 *   label    — column header text
 *   sortKey  — field key passed to toggleSort()
 *   sort     — { key, dir } from useTableFilter
 *   onSort   — toggleSort from useTableFilter
 */
export function SortableTh({ label, sortKey, sort, onSort }) {
  const isActive = sort.key === sortKey;
  return (
    <th
      className={`th-sortable${isActive ? ' sort-active' : ''}`}
      onClick={() => onSort(sortKey)}
      aria-sort={isActive ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span className="th-content">
        {label}
        <span className="sort-icon" aria-hidden="true">
          {isActive ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </span>
    </th>
  );
}

/* ── Shared filter-option sets ──────────────────────────────────────────── */
export const STATUS_FILTER_OPTIONS = [
  { value: '',          label: 'All statuses'  },
  { value: 'PENDING',   label: 'Pending'       },
  { value: 'CONFIRMED', label: 'Confirmed'     },
  { value: 'CANCELLED', label: 'Cancelled'     },
  { value: 'COMPLETED', label: 'Completed'     },
];

export const CUSTOMER_APPT_FILTER_OPTIONS = [
  { value: '',            label: 'All customers'    },
  { value: 'HAS_APPTS',  label: 'Has appointments' },
  { value: 'HAS_PENDING', label: 'Has pending'      },
  { value: 'HAS_CONFIRMED', label: 'Has confirmed'  },
  { value: 'NO_APPTS',   label: 'No appointments'  },
];

/** Filter predicate for customers by appointment status presence */
export function customerApptFilterFn(customer, value) {
  switch (value) {
    case 'HAS_APPTS':    return (customer.appointments?.length ?? 0) > 0;
    case 'HAS_PENDING':  return customer.appointments?.some((a) => a.status === 'PENDING')  ?? false;
    case 'HAS_CONFIRMED':return customer.appointments?.some((a) => a.status === 'CONFIRMED') ?? false;
    case 'NO_APPTS':     return (customer.appointments?.length ?? 0) === 0;
    default:             return true;
  }
}

/** Filter predicate for appointments by status */
export function statusFilterFn(item, value) {
  return item.status === value;
}

import { useState } from 'react';

/**
 * Extracts a nested or special field value from a record.
 * 'appointmentCount' is a virtual key that returns appointments array length.
 */
function getVal(item, key) {
  if (key === 'appointmentCount') return item.appointments?.length ?? 0;
  return key.split('.').reduce((o, k) => o?.[k], item) ?? '';
}

/**
 * Generic comparator: handles numbers, ISO date strings, and falls back to
 * locale-aware string comparison.
 */
function compare(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  const nA = Number(a), nB = Number(b);
  if (!isNaN(nA) && !isNaN(nB) && String(a).trim() !== '' && String(b).trim() !== '')
    return nA - nB;
  if (/^\d{4}-\d{2}-\d{2}/.test(String(a)))
    return new Date(a) - new Date(b);
  return String(a).localeCompare(String(b), undefined, { sensitivity: 'base', numeric: true });
}

/**
 * useTableFilter — generic client-side search / filter / sort hook.
 *
 * @param {Array}    data         Source array (should be stable; update via setState)
 * @param {string[]} searchKeys   Dot-path field names to include in text search
 * @param {Function} filterFn     (item, filterValue) => bool  — custom predicate for the filter dropdown
 * @param {string}   defaultSortKey  Initial sort column key (null = unsorted)
 * @param {string}   defaultSortDir  'asc' | 'desc'
 *
 * All filtering is done in-memory; suitable for datasets up to several hundred rows.
 */
export function useTableFilter(
  data = [],
  searchKeys = [],
  filterFn = null,
  defaultSortKey = null,
  defaultSortDir = 'asc',
) {
  const [query, setQuery]           = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sort, setSort]             = useState({ key: defaultSortKey, dir: defaultSortDir });

  // ── apply search ──────────────────────────────────────────────────────────
  const q = query.trim().toLowerCase();
  let result = q
    ? data.filter(item =>
        searchKeys.some(key =>
          String(getVal(item, key)).toLowerCase().includes(q)
        )
      )
    : data;

  // ── apply filter ──────────────────────────────────────────────────────────
  if (filterValue && filterFn) {
    result = result.filter(item => filterFn(item, filterValue));
  }

  // ── apply sort ────────────────────────────────────────────────────────────
  if (sort.key) {
    result = [...result].sort((a, b) => {
      const cmp = compare(getVal(a, sort.key), getVal(b, sort.key));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }

  const toggleSort = (key) =>
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );

  const clearAll = () => {
    setQuery('');
    setFilterValue('');
    setSort({ key: defaultSortKey, dir: defaultSortDir });
  };

  return {
    filtered: result,
    total: data.length,
    query,        setQuery,
    filterValue,  setFilterValue,
    sort,         toggleSort,
    clearAll,
    isFiltered: Boolean(q || filterValue),
  };
}

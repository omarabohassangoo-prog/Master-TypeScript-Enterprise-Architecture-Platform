import { useState, useMemo } from 'react';

export function useFilters<T>(
  items: T[] = [],
  filterFn: (item: T, search: string, status?: string) => boolean
) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return items.filter(item => filterFn(item, search.trim().toLowerCase(), status));
  }, [items, search, status, filterFn]);

  return {
    filteredItems,
    search,
    setSearch,
    status,
    setStatus,
    clearFilters: () => {
      setSearch('');
      setStatus('all');
    },
  };
}

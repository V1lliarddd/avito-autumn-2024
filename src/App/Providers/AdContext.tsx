import { createContext, useContext, useState, type ReactNode } from 'react';

export type SortFields = 'price' | 'views' | 'likes';

type FilterContextValue = {
  search: string;
  setSearch: (value: string) => void;
  maxAdsPerPage: number;
  setMaxAdsPerPage: (value: number) => void;
  sort: SortFields;
  setSort: (value: SortFields) => void;
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function AdProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState<string>('');
  const [maxAdsPerPage, setMaxAdsPerPage] = useState<number>(10);
  const [sort, setSort] = useState<SortFields>('price');

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleMaxAdsPerPageChange = (value: number) => {
    setMaxAdsPerPage(value);
  };

  const handleSortChange = (value: SortFields) => {
    setSort(value);
  };

  return (
    <FilterContext.Provider
      value={{
        search,
        maxAdsPerPage,
        sort,
        setSearch: handleSearchChange,
        setMaxAdsPerPage: handleMaxAdsPerPageChange,
        setSort: handleSortChange
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error('useFilter must be used within AdProvider');
  }
  return ctx;
}

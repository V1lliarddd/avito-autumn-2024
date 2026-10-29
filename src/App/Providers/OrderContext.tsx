import { createContext, useContext, useState, type ReactNode } from 'react';

type OrderContextValue = {
  status: number;
  setStatus: (value: number) => void;
  priceSort: 'desc' | 'asc';
  setPriceSort: (value: 'asc' | 'desc') => void;
  maxAdsPerPage: number;
  setMaxAdsPerPage: (value: number) => void;
};

const OrderFilterContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<number>(0);
  const [priceSort, setPriceSort] = useState<'desc' | 'asc'>('desc');
  const [maxAdsPerPage, setMaxAdsPerPage] = useState<number>(10);

  const handleStatusChange = (value: number) => {
    setStatus(value);
  };

  const handlePriceSortChange = (value: 'asc' | 'desc') => {
    setPriceSort(value);
  };

  const handleMaxAdsPerPageChange = (value: number) => {
    setMaxAdsPerPage(value);
  };

  return (
    <OrderFilterContext.Provider
      value={{
        maxAdsPerPage,
        status,
        priceSort,
        setStatus: handleStatusChange,
        setPriceSort: handlePriceSortChange,
        setMaxAdsPerPage: handleMaxAdsPerPageChange
      }}
    >
      {children}
    </OrderFilterContext.Provider>
  );
}

export function useOrderFilter() {
  const ctx = useContext(OrderFilterContext);
  if (!ctx) {
    throw new Error('useFilter must be used within OrderProvider');
  }
  return ctx;
}

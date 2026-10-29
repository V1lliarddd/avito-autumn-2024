import { useCallback, useEffect, useMemo, useState } from 'react';
import s from './Order.module.css';
import type { Order as OrderModel } from '@types';
import { Request } from '@/Shared/Hooks/useFetch';
import { OrderItem } from '@/Widgets/OrderItem';
import { OrderFilters } from '@/Widgets/OrderFilters';
import { useOrderFilter } from '@/App/Providers/OrderContext';
import type { PaginatedResponse } from '../Catalog/types';
import { Button } from 'antd';
import { useSearchParams } from 'react-router-dom';

function Order() {
  const [searchParams] = useSearchParams();
  const adId = searchParams.get('adId');
  const [data, setData] = useState<OrderModel[]>([]);
  const { priceSort, status, maxAdsPerPage } = useOrderFilter();
  const [pages, setPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const params = new URLSearchParams({
          _page: String(currentPage),
          _per_page: String(maxAdsPerPage),
          _sort: priceSort === 'asc' ? 'total' : '-total'
        });
        if (status !== -1) params.set('status:in', String(status));
        const res = await Request<PaginatedResponse<OrderModel>>(
          `http://localhost:3000/orders?${params}`,
          {
            method: 'GET',
            signal: controller.signal
          }
        );

        setPages(res.pages);
        setData(res.data);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        if (e instanceof Error) {
          console.error(e.message);
        } else {
          console.error(e);
        }
      }
    };
    fetchData();

    return () => {
      controller.abort();
    };
  }, [priceSort, status, maxAdsPerPage, currentPage, adId]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const filteredData = useMemo(() => {
    if (!adId) return data;
    return data.filter((order) => order.items.some((item) => item.id === adId));
  }, [data, adId]);
  return (
    <>
      <div className={s.container}>
        <h2>Заказы</h2>
        <OrderFilters />
        <ul>
          {filteredData &&
            filteredData.map((item) => (
              <li key={item.id}>
                <OrderItem orderItem={item} />
              </li>
            ))}
          {filteredData.length === 0 && <h2>Заказов пока нет</h2>}
        </ul>
        <div className={s.pagination}>
          {pages &&
            Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
              <Button
                size="large"
                onClick={() => handlePageChange(page)}
                key={page}
              >
                {page}
              </Button>
            ))}
        </div>
      </div>
    </>
  );
}

export default Order;

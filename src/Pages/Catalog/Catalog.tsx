import { Request } from '@/Shared/Hooks/useFetch';
import { AdItem } from '@/Widgets/AdItem';
import type { Advertisment } from '@types';
import { useCallback, useEffect, useState } from 'react';
import s from './Catalog.module.css';
import { CatalogFilters } from '@/Widgets/CatalogFilters';
import type { PaginatedResponse } from './types';
import { useFilter } from '@/App/Providers/AdContext';
import { Button } from 'antd';
import { ModalFormAdd } from '@/Widgets/ModalFormAdd';
import type { FieldType } from '@/Widgets/ModalFormAdd/types';
import { useDebounce } from '@/Shared/Hooks/useDebounce';

function Catalog() {
  const [ad, setAd] = useState<Advertisment[]>([]);
  const { search, maxAdsPerPage, sort } = useFilter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const params = new URLSearchParams({
          _page: String(currentPage),
          _per_page: String(maxAdsPerPage),
          _sort: `-${String(sort)}`
        });
        if (debouncedSearch) params.set('name:contains', debouncedSearch);
        const data = await Request<PaginatedResponse<Advertisment>>(
          `http://localhost:3000/advertisements?${params}`,
          {
            signal: controller.signal
          }
        );
        setPages(data.pages);
        setAd(data.data);
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
  }, [maxAdsPerPage, currentPage, debouncedSearch, sort]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleAddClick = useCallback(() => setIsModalOpen((prev) => !prev), []);

  const handleAddSubmit = async (values: FieldType) => {
    handleAddClick();

    try {
      const res = await Request<Advertisment>(
        `http://localhost:3000/advertisements/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: {
            name: values.title,
            price: values.price,
            createdAt: String(new Date()),
            views: 0,
            likes: 0,
            imageUrl: values.image,
            description: values.description
          }
        }
      );

      setAd((prev) => [...prev, res]);
    } catch (e) {
      console.log(e);
    }
  };

  const initialModalData = {
    name: '',
    description: '',
    price: 0,
    imageUrl: ''
  };

  return (
    <>
      {isModalOpen && (
        <ModalFormAdd
          initialData={initialModalData}
          isModalOpen={isModalOpen}
          onCancel={handleAddClick}
          onSubmit={handleAddSubmit}
        />
      )}
      <h2 className={s.title}>Объявления</h2>
      <div className={s.panel}>
        <CatalogFilters />
        <Button onClick={handleAddClick}>Добавить объявление</Button>
      </div>
      <div className={s.container}>
        {ad && ad.map((item) => <AdItem adItem={item} key={item.id} />)}
      </div>
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
    </>
  );
}

export default Catalog;

import { useFilter, type SortFields } from '@/App/Providers/AdContext';
import s from './Filters.module.css';
import { Input } from 'antd';
import { Select } from 'antd';

function CatalogFilters() {
  const { search, maxAdsPerPage, setMaxAdsPerPage, setSearch, setSort, sort } =
    useFilter();

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>
  ) => {
    setSearch(e.target.value);
  };

  const handleMaxAdsSelect = (e: string) => {
    setMaxAdsPerPage(Number(e));
  };

  const handleSortSelect = (e: SortFields) => {
    setSort(e);
  };

  return (
    <div className={s.container}>
      <Input
        placeholder="Название объявления"
        size="medium"
        onChange={(e) => handleSearchChange(e)}
        defaultValue={search}
      />
      <div className={s.block}>
        <p>Кол-во записей:</p>
        <Select
          defaultValue={String(maxAdsPerPage)}
          options={[
            { value: 5, label: '5' },
            { value: 10, label: '10' },
            { value: 20, label: '20' }
          ]}
          onChange={(e) => handleMaxAdsSelect(e)}
        />
      </div>
      <div className={s.block}>
        <p>Сортировать по:</p>
        <Select
          defaultValue={sort}
          options={[
            { value: 'price', label: 'По цене' },
            { value: 'views', label: 'По просмотрам' },
            { value: 'likes', label: 'По лайкам' }
          ]}
          onChange={(e) => handleSortSelect(e)}
        />
      </div>
    </div>
  );
}

export default CatalogFilters;

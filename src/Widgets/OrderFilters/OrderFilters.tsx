import { Radio, Select, type RadioChangeEvent } from 'antd';
import s from './OrderFilters.module.css';
import { useOrderFilter } from '@/App/Providers/OrderContext';

function OrderFilters() {
  const {
    setStatus,
    priceSort,
    setPriceSort,
    maxAdsPerPage,
    setMaxAdsPerPage
  } = useOrderFilter();

  const handleStatusChange = (value: number) => {
    setStatus(value);
  };

  const handleMaxAdsSelect = (e: string) => {
    setMaxAdsPerPage(Number(e));
  };

  const handlePriceSortChange = (e: RadioChangeEvent) => {
    setPriceSort(e.target.value);
  };
  return (
    <div className={s.container}>
      <Select
        onChange={(e) => handleStatusChange(e)}
        defaultValue={0}
        options={[
          { value: 0, label: 'Создан' },
          {
            value: 1,
            label: 'Оплачен'
          },
          { value: 2, label: 'В пути' },
          {
            value: 3,
            label: 'Доставлен в пункт выдачи'
          },
          { value: 4, label: 'Получен' },
          {
            value: 5,
            label: 'Архивирован'
          },
          { value: 6, label: 'Возврат' },
          { value: -1, label: 'Все' }
        ]}
      />
      <div className={s.price_sort}>
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
      <div className={s.price_sort}>
        <p>Цена:</p>
        <Radio.Group
          value={priceSort}
          onChange={(e) => handlePriceSortChange(e)}
          options={[
            { value: 'asc', label: 'По возрастанию' },
            { value: 'desc', label: 'По убыванию' }
          ]}
        />
      </div>
    </div>
  );
}

export default OrderFilters;

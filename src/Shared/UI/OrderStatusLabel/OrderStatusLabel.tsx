import type { OrderStatusLabelProps } from './types';

const STATUS_LABELS = [
  'Создан',
  'Оплачен',
  'В пути',
  'Доставлен в пункт выдачи',
  'Получен',
  'Архивирован',
  'Возврат'
];

const STATUS_COLORS = [
  '#9e9e9e',
  '#2196f3',
  '#ff9800',
  '#009688',
  '#4caf50',
  '#607d8b',
  '#f44336'
];

function OrderStatusLabel({ statusNumber }: OrderStatusLabelProps) {
  return (
    <span
      style={{
        color: STATUS_COLORS[statusNumber]
      }}
    >
      {STATUS_LABELS[statusNumber]}
    </span>
  );
}

export default OrderStatusLabel;

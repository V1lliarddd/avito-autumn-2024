import { useMemo, useState } from 'react';
import type { OrderItemProps } from './types';
import s from './OrderItem.module.css';
import { OrderStatusLabel } from '@/Shared/UI/OrderStatusLabel';
import type { Order } from '@types';
import productPlaceholder from '@/Assets/Images/product-placeholder.jpg';
import { Link } from 'react-router-dom';

const FINAL_STATUSES: Order['status'][] = [4, 5, 6];

function OrderItem({ orderItem }: OrderItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsCount = useMemo(
    () => orderItem.items.reduce((sum, item) => sum + item.count, 0),
    [orderItem.items]
  );

  const canFinish = !FINAL_STATUSES.includes(orderItem.status);

  const createdAt = new Date(orderItem.createdAt).toLocaleString('ru-RU');

  return (
    <div className={s.container}>
      <ul className={s.list}>
        <li className={s.row}>
          <span className={s.label}>Заказ №</span>
          <span className={s.value}>{orderItem.id}</span>
        </li>

        <li className={s.row}>
          <span className={s.label}>Статус</span>
          <span className={s.value}>
            <OrderStatusLabel statusNumber={orderItem.status} />
          </span>
        </li>

        <li className={s.row}>
          <span className={s.label}>Товаров</span>
          <span className={s.value}>{itemsCount} шт.</span>
        </li>

        <li className={s.row}>
          <span className={s.label}>Стоимость</span>
          <span className={s.value}>
            {orderItem.total.toLocaleString('ru-RU')} ₽
          </span>
        </li>

        <li className={s.row}>
          <span className={s.label}>Создан</span>
          <span className={s.value}>{createdAt}</span>
        </li>

        <li className={s.row}>
          <span className={s.label}>Завершение</span>
          <span className={s.value}>
            {canFinish ? 'Доступно' : 'Недоступно'}
          </span>
        </li>
      </ul>

      <button
        type="button"
        className={s.showItemsButton}
        onClick={() => setIsModalOpen(true)}
      >
        Показать все товары ({orderItem.items.length})
      </button>

      {isModalOpen && (
        <div className={s.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div
            className={s.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Товары заказа №${orderItem.id}`}
          >
            <div className={s.modalHeader}>
              <h3>Товары заказа №{orderItem.id}</h3>
              <button
                type="button"
                className={s.closeButton}
                onClick={() => setIsModalOpen(false)}
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>

            <ul className={s.itemsList}>
              {orderItem.items.map((item) => (
                <Link
                  to={`/ad/${item.id}`}
                  style={{ textDecoration: 'none', color: 'black' }}
                  key={item.id}
                >
                  <li className={s.itemRow}>
                    <img
                      src={item.imageUrl || productPlaceholder}
                      alt={item.name}
                      className={s.itemImage}
                    />
                    <div className={s.itemInfo}>
                      <p className={s.itemName}>{item.name}</p>
                      <p className={s.itemMeta}>
                        {item.price.toLocaleString('ru-RU')} ₽ × {item.count}
                      </p>
                    </div>
                    <p className={s.itemSum}>
                      {(item.price * item.count).toLocaleString('ru-RU')} ₽
                    </p>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderItem;

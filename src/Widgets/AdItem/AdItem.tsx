import s from './AdItem.module.css';
import eye from '@/Assets/Icons/eye.svg';
import like from '@/Assets/Icons/thumb_up.svg';
import type { AdItemProps } from './types';
import productPlaceholder from '@/Assets/Images/product-placeholder.jpg';
import { Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';

function AdItem({ adItem }: AdItemProps) {
  const { Meta } = Card;
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      variant="outlined"
      cover={
        <img
          draggable={false}
          alt={adItem.name}
          src={adItem.imageUrl || productPlaceholder}
        />
      }
    >
      <Meta
        title={adItem.name}
        description={
          <>
            <p className={s.item_description}>
              {adItem.description || 'Описание отсутствует'}
            </p>
          </>
        }
      />
      <p className={s.item_price}>{adItem.price} руб.</p>
      <div className={s.info}>
        <div className={s.info_subcontainer}>
          <img src={eye} alt="Просмотры" />
          <p>{adItem.views}</p>
        </div>
        <div className={s.info_subcontainer}>
          <img src={like} alt="Лайки" />
          <p>{adItem.likes}</p>
        </div>
      </div>
      <div className={s.buttons}>
        <Button
          className={s.button}
          onClick={() => navigate(`/ad/${adItem.id}`)}
          size="large"
        >
          Подробнее
        </Button>
        <Button
          size="large"
          className={s.button}
          onClick={() => {
            navigate(`/orders?adId=${adItem.id}`);
          }}
        >
          Заказы
        </Button>
      </div>
    </Card>
  );
}

export default AdItem;

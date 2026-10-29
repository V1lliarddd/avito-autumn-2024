import s from './Ad.module.css';
import eye from '@/Assets/Icons/eye.svg';
import like from '@/Assets/Icons/thumb_up.svg';
import { Request } from '@/Shared/Hooks/useFetch';
import type { Advertisment } from '@types';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import productPlaceholder from '@/Assets/Images/product-placeholder.jpg';
import { Button } from 'antd';
import { ModalFormEdit } from '@widgets/ModalFormEdit';
import type { FieldType } from '@/Widgets/ModalFormEdit/types';

function Ad() {
  const { id } = useParams<string>();
  const [data, setData] = useState<Advertisment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    try {
      const fetchData = async () => {
        const res = await Request<Advertisment>(
          `http://localhost:3000/advertisements/${id}`,
          {
            signal: controller.signal
          }
        );
        setData(res);
      };
      fetchData();
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      if (e instanceof Error) {
        console.error(e.message);
      } else {
        console.error(e);
      }
    }

    return () => {
      controller.abort();
    };
  }, []);

  const handleEditClick = useCallback(
    () => setIsModalOpen((prev) => !prev),
    []
  );

  const handleEditSubmit = async (values: Omit<FieldType, 'remember'>) => {
    handleEditClick();

    try {
      const res = await Request<Advertisment>(
        `http://localhost:3000/advertisements/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: {
            name: values.title,
            price: values.price,
            createdAt: String(new Date()),
            views: data?.views,
            likes: data?.likes,
            imageUrl: values.image,
            description: values.description
          }
        }
      );

      setData(res);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      {!data && <div>Загрузка...</div>}
      {isModalOpen && data && (
        <ModalFormEdit
          initialData={data}
          onSubmit={handleEditSubmit}
          onCancel={handleEditClick}
          isModalOpen={isModalOpen}
        />
      )}
      <div className={s.container}>
        <div className={s.spotlight}>
          <img src={data?.imageUrl || productPlaceholder} alt={data?.name} />
          <div className={s.info}>
            <div className={s.info_subcontainer}>
              <img src={eye} alt="Просмотры" />
              <p>{data?.views}</p>
            </div>
            <div className={s.info_subcontainer}>
              <img src={like} alt="Лайки" />
              <p>{data?.likes}</p>
            </div>
          </div>
        </div>
        <div className={s.info_text}>
          <h1>{data?.name}</h1>
          <p>{data?.description || 'Описание отсутствует'}</p>
          <Button
            onClick={handleEditClick}
            type="default"
            color="default"
            size="large"
          >
            Редактировать
          </Button>
        </div>
      </div>
    </>
  );
}

export default Ad;

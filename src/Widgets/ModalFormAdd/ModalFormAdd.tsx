import { Button, Form, Input, Modal, type FormProps } from 'antd';
import type { FieldType, ModalFormProps } from './types';
import { useCallback } from 'react';

function ModalFormAdd({
  initialData,
  isModalOpen,
  onCancel,
  onSubmit
}: ModalFormProps) {
  const handleSubmit: FormProps<FieldType>['onFinish'] = useCallback(
    (values) => {
      onSubmit(values);
    },
    []
  );

  return (
    <Modal
      title="Добавление объявления"
      footer={null}
      open={isModalOpen}
      onCancel={onCancel}
    >
      <Form
        name="add"
        initialValues={{
          title: initialData.name,
          description: initialData.description,
          price: initialData.price,
          imageUrl: initialData.imageUrl
        }}
        onFinish={handleSubmit}
      >
        <Form.Item<FieldType>
          label="Название"
          name="title"
          rules={[
            { required: true, message: 'Пожалуйста введите наименование!' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item<FieldType>
          label="Описание"
          name="description"
          rules={[{ required: true, message: 'Пожалуйста введите описание!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<FieldType>
          label="Цена"
          name="price"
          rules={[{ required: true, message: 'Пожалуйста введите цену!' }]}
        >
          <Input type={'number'} />
        </Form.Item>
        <Form.Item<FieldType>
          label="Изображение"
          name="image"
          rules={[
            {
              required: true,
              message: 'Пожалуйста укажите путь до изображения!'
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={null}>
          <Button type="primary" size="large" htmlType="submit">
            Добавить
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalFormAdd;

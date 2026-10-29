import { Button, Form, Input, Modal, type FormProps } from 'antd';
import type { FieldType, ModalFormProps } from './types';
import { useCallback } from 'react';

function ModalFormEdit({
  isModalOpen,
  onCancel,
  onSubmit,
  initialData
}: ModalFormProps) {
  const handleSubmit: FormProps<FieldType>['onFinish'] = useCallback(
    (values) => {
      onSubmit(values);
    },
    []
  );
  return (
    <Modal
      title="Редактирование объявления"
      open={isModalOpen}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        name="edit"
        initialValues={{
          remember: true,
          title: initialData.name,
          description: initialData.description,
          price: initialData.price,
          image: initialData.imageUrl
        }}
        onFinish={handleSubmit}
        onFinishFailed={() => {}}
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
          rules={[{ required: false }]}
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
            { required: true, message: 'Пожалуйста введите URL изображения!' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={null}>
          <Button type="primary" size="large" htmlType="submit">
            Редактировать
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalFormEdit;

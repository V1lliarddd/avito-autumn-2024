import type { Advertisment } from '@types';

export type FieldType = {
  title: string;
  description: string;
  price: number;
  image: string;
};

export type ModalFormProps = {
  isModalOpen: boolean;
  onSubmit: (values: Omit<FieldType, 'remember'>) => void;
  onCancel: () => void;
  initialData: Pick<
    Advertisment,
    'imageUrl' | 'description' | 'name' | 'price'
  >;
};

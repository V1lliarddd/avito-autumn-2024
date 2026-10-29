import type { Advertisment } from '@types';

export type FieldType = {
  title: string;
  description: string;
  price: number;
  image: string;
  remember?: string;
};

export type ModalFormProps = {
  isModalOpen: boolean;
  onSubmit: (values: Omit<FieldType, 'remember'>) => void;
  onCancel: () => void;
  initialData: Advertisment;
};

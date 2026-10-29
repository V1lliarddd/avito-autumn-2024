// src/pages/Ad/Ad.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Advertisment } from '@types';

let mockId: string | undefined = '1';
vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: mockId })
}));

const mockRequest = vi.fn();
vi.mock('@/Shared/Hooks/useFetch', () => ({
  Request: (...args: unknown[]) => mockRequest(...args)
}));

vi.mock('@/Assets/Icons/eye.svg', () => ({ default: 'eye.svg' }));
vi.mock('@/Assets/Icons/thumb_up.svg', () => ({ default: 'like.svg' }));
vi.mock('@/Assets/Images/product-placeholder.jpg', () => ({
  default: 'placeholder.jpg'
}));

vi.mock('antd', () => ({
  Button: ({
    children,
    onClick,
    ...rest
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button onClick={onClick} {...rest}>
      {children}
    </button>
  )
}));

vi.mock('@widgets/ModalFormEdit', () => ({
  ModalFormEdit: ({
    initialData,
    onSubmit,
    onCancel
  }: {
    initialData: Advertisment;
    onSubmit: (v: unknown) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="modal-form-edit">
      <span data-testid="modal-initial-name">{initialData.name}</span>
      <button
        onClick={() =>
          onSubmit({
            title: 'Обновлённое',
            price: 999,
            image: 'new.png',
            description: 'new desc'
          })
        }
      >
        submit
      </button>
      <button onClick={onCancel}>cancel</button>
    </div>
  )
}));

import Ad from './Ad';

function makeAd(overrides: Partial<Advertisment> = {}): Advertisment {
  return {
    id: '1',
    name: 'Телефон',
    price: 100,
    createdAt: '2025-01-01T00:00:00.000Z',
    views: 42,
    likes: 7,
    imageUrl: 'img.png',
    description: 'Хороший телефон',
    ...overrides
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockId = '1';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Ad page', () => {
  it('показывает «Загрузка...», пока данных нет', () => {
    mockRequest.mockReturnValue(new Promise(() => {})); // никогда не резолвится
    render(<Ad />);

    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('загружает объявление по id и рендерит поля', async () => {
    mockRequest.mockResolvedValue(makeAd());

    render(<Ad />);

    expect(await screen.findByText('Телефон')).toBeInTheDocument();
    expect(screen.getByText('Хороший телефон')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument(); // views
    expect(screen.getByText('7')).toBeInTheDocument(); // likes
  });

  it('делает запрос по URL с id из useParams', async () => {
    mockId = 'abc';
    mockRequest.mockResolvedValue(makeAd({ id: 'abc' }));

    render(<Ad />);
    await waitFor(() => expect(mockRequest).toHaveBeenCalled());

    const url = mockRequest.mock.calls[0][0] as string;
    expect(url).toBe('http://localhost:3000/advertisements/abc');
  });

  it('использует imageUrl, если он есть', async () => {
    mockRequest.mockResolvedValue(makeAd({ imageUrl: 'my.png' }));
    render(<Ad />);

    const img = await screen.findByAltText('Телефон');
    expect(img).toHaveAttribute('src', 'my.png');
  });

  it('подставляет placeholder, если imageUrl пустой', async () => {
    mockRequest.mockResolvedValue(makeAd({ imageUrl: '' }));
    render(<Ad />);

    const img = await screen.findByAltText('Телефон');
    expect(img).toHaveAttribute('src', 'placeholder.jpg');
  });

  it('показывает «Описание отсутствует», если description пустой', async () => {
    mockRequest.mockResolvedValue(makeAd({ description: '' }));
    render(<Ad />);

    expect(await screen.findByText('Описание отсутствует')).toBeInTheDocument();
  });

  it('открывает модалку редактирования по кнопке', async () => {
    mockRequest.mockResolvedValue(makeAd());
    render(<Ad />);
    await screen.findByText('Телефон');

    expect(screen.queryByTestId('modal-form-edit')).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Редактировать' })
    );

    expect(screen.getByTestId('modal-form-edit')).toBeInTheDocument();
    expect(screen.getByTestId('modal-initial-name')).toHaveTextContent(
      'Телефон'
    );
  });

  it('не открывает модалку, пока data = null', async () => {
    mockRequest.mockReturnValue(new Promise(() => {}));
    render(<Ad />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Редактировать' })
    );

    expect(screen.queryByTestId('modal-form-edit')).not.toBeInTheDocument();
  });

  it('закрывает модалку по onCancel', async () => {
    mockRequest.mockResolvedValue(makeAd());
    render(<Ad />);
    await screen.findByText('Телефон');

    await userEvent.click(
      screen.getByRole('button', { name: 'Редактировать' })
    );
    await userEvent.click(screen.getByRole('button', { name: 'cancel' }));

    expect(screen.queryByTestId('modal-form-edit')).not.toBeInTheDocument();
  });

  it('при submit делает PATCH и обновляет данные', async () => {
    mockRequest
      .mockResolvedValueOnce(makeAd())
      .mockResolvedValueOnce(makeAd({ name: 'Обновлённое', price: 999 }));

    render(<Ad />);
    await screen.findByText('Телефон');

    await userEvent.click(
      screen.getByRole('button', { name: 'Редактировать' })
    );
    await userEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => {
      expect(screen.getByText('Обновлённое')).toBeInTheDocument();
    });

    const patchCall = mockRequest.mock.calls.find(
      ([, opts]) => (opts as { method?: string })?.method === 'PATCH'
    );
    expect(patchCall).toBeDefined();

    const body = (patchCall![1] as { body: Record<string, unknown> }).body;
    expect(body).toMatchObject({
      name: 'Обновлённое',
      price: 999,
      imageUrl: 'new.png',
      description: 'new desc',
      views: 42,
      likes: 7
    });
  });

  it('закрывает модалку после submit', async () => {
    mockRequest
      .mockResolvedValueOnce(makeAd())
      .mockResolvedValueOnce(makeAd({ name: 'Обновлённое' }));

    render(<Ad />);
    await screen.findByText('Телефон');

    await userEvent.click(
      screen.getByRole('button', { name: 'Редактировать' })
    );
    await userEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => {
      expect(screen.queryByTestId('modal-form-edit')).not.toBeInTheDocument();
    });
  });

  it('отменяет запрос при размонтировании', async () => {
    let capturedSignal: AbortSignal | undefined;

    mockRequest.mockImplementation((_url, opts?: { signal?: AbortSignal }) => {
      capturedSignal = opts?.signal;
      return new Promise((_resolve, reject) => {
        opts?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError'))
        );
      });
    });

    const { unmount } = render(<Ad />);
    await waitFor(() => expect(capturedSignal).toBeDefined());

    unmount();

    expect(capturedSignal!.aborted).toBe(true);
  });

  it('игнорирует AbortError (не логирует)', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockRequest.mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    render(<Ad />);
    await waitFor(() => expect(mockRequest).toHaveBeenCalled());

    expect(errSpy).not.toHaveBeenCalled();
  });

  it('логирует обычную ошибку через console.error', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockRequest.mockRejectedValue(new Error('Network fail'));

    render(<Ad />);
    await waitFor(() => expect(errSpy).toHaveBeenCalledWith('Network fail'));
  });

  it('логирует не-Error значение через console.error', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockRequest.mockRejectedValue('строковая ошибка');

    render(<Ad />);
    await waitFor(() =>
      expect(errSpy).toHaveBeenCalledWith('строковая ошибка')
    );
  });

  it('логирует ошибку PATCH через console.log', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockRequest
      .mockResolvedValueOnce(makeAd())
      .mockRejectedValueOnce(new Error('PATCH fail'));

    render(<Ad />);
    await screen.findByText('Телефон');

    await userEvent.click(
      screen.getByRole('button', { name: 'Редактировать' })
    );
    await userEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => expect(logSpy).toHaveBeenCalled());
  });
});

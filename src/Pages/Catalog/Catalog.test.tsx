// src/pages/Catalog/Catalog.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Advertisment } from '@types';

let mockFilter = {
  search: '',
  maxAdsPerPage: 10,
  sort: 'price' as 'price' | 'views' | 'likes'
};

vi.mock('@/App/Providers/AdContext', () => ({
  useFilter: () => mockFilter
}));

const mockRequest = vi.fn();
vi.mock('@/Shared/Hooks/useFetch', () => ({
  Request: (...args: unknown[]) => mockRequest(...args)
}));

vi.mock('@/Shared/Hooks/useDebounce', () => ({
  useDebounce: (v: string) => v
}));

vi.mock('@/Widgets/AdItem', () => ({
  AdItem: ({ adItem }: { adItem: Advertisment }) => (
    <div data-testid="ad-item">{adItem.name}</div>
  )
}));

vi.mock('@/Widgets/CatalogFilters', () => ({
  CatalogFilters: () => <div data-testid="catalog-filters" />
}));

vi.mock('@/Widgets/ModalFormAdd', () => ({
  ModalFormAdd: ({
    onSubmit,
    onCancel
  }: {
    onSubmit: (v: unknown) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="modal-form-add">
      <button
        onClick={() =>
          onSubmit({
            title: 'Новое',
            price: 100,
            image: 'img.png',
            description: 'desc'
          })
        }
      >
        submit
      </button>
      <button onClick={onCancel}>cancel</button>
    </div>
  )
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

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  )
}));

import Catalog from './Catalog';

function makeAd(id: string, name: string): Advertisment {
  return {
    id,
    name,
    price: 100,
    createdAt: '2025-01-01T00:00:00.000Z',
    views: 0,
    likes: 0,
    imageUrl: 'img.png',
    description: 'desc'
  };
}

function paginated(data: Advertisment[], pages = 1) {
  return {
    first: 1,
    prev: null,
    next: null,
    last: pages,
    pages,
    items: data.length,
    data
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFilter = { search: '', maxAdsPerPage: 10, sort: 'price' };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Catalog page', () => {
  it('загружает и рендерит объявления', async () => {
    mockRequest.mockResolvedValue(
      paginated([makeAd('1', 'Телефон'), makeAd('2', 'Ноутбук')])
    );

    render(<Catalog />);

    expect(await screen.findByText('Телефон')).toBeInTheDocument();
    expect(screen.getByText('Ноутбук')).toBeInTheDocument();
    expect(screen.getAllByTestId('ad-item')).toHaveLength(2);
  });

  it('формирует query-строку с _page, _per_page и _sort', async () => {
    mockFilter = { search: '', maxAdsPerPage: 5, sort: 'views' };
    mockRequest.mockResolvedValue(paginated([]));

    render(<Catalog />);
    await waitFor(() => expect(mockRequest).toHaveBeenCalled());

    const url = mockRequest.mock.calls[0][0] as string;
    expect(url).toContain('_page=1');
    expect(url).toContain('_per_page=5');
    expect(url).toContain('_sort=-views');
  });

  it('передаёт поиск в name:contains', async () => {
    mockFilter = { search: 'телефон', maxAdsPerPage: 10, sort: 'price' };
    mockRequest.mockResolvedValue(paginated([]));

    render(<Catalog />);
    await waitFor(() => expect(mockRequest).toHaveBeenCalled());

    const url = mockRequest.mock.calls[0][0] as string;
    expect(url).toContain('name%3Acontains=телефон');
  });

  it('не передаёт поиск, если строка пустая', async () => {
    mockFilter = { search: '   ', maxAdsPerPage: 10, sort: 'price' };
    mockRequest.mockResolvedValue(paginated([]));

    render(<Catalog />);
    await waitFor(() => expect(mockRequest).toHaveBeenCalled());

    const url = mockRequest.mock.calls[0][0] as string;
    expect(url).not.toContain('name%3Acontains');
  });

  it('рендерит кнопки пагинации по pages', async () => {
    mockRequest.mockResolvedValue(paginated([makeAd('1', 'A')], 3));

    render(<Catalog />);

    expect(
      await screen.findByRole('button', { name: '1' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
  });

  it('по клику на страницу делает запрос с новым _page', async () => {
    mockRequest.mockResolvedValue(paginated([makeAd('1', 'A')], 3));

    render(<Catalog />);
    await screen.findByRole('button', { name: '2' });

    await userEvent.click(screen.getByRole('button', { name: '2' }));

    await waitFor(() => {
      const lastUrl = mockRequest.mock.calls.at(-1)?.[0] as string;
      expect(lastUrl).toContain('_page=2');
    });
  });

  it('открывает модалку по кнопке «Добавить объявление»', async () => {
    mockRequest.mockResolvedValue(paginated([]));
    render(<Catalog />);

    expect(screen.queryByTestId('modal-form-add')).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Добавить объявление' })
    );

    expect(screen.getByTestId('modal-form-add')).toBeInTheDocument();
  });

  it('закрывает модалку по onCancel', async () => {
    mockRequest.mockResolvedValue(paginated([]));
    render(<Catalog />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Добавить объявление' })
    );
    await userEvent.click(screen.getByRole('button', { name: 'cancel' }));

    expect(screen.queryByTestId('modal-form-add')).not.toBeInTheDocument();
  });

  it('при отправке формы делает POST и добавляет объявление в список', async () => {
    mockRequest
      .mockResolvedValueOnce(paginated([makeAd('1', 'Старое')]))
      .mockResolvedValueOnce(makeAd('2', 'Новое'));

    render(<Catalog />);
    await screen.findByText('Старое');

    await userEvent.click(
      screen.getByRole('button', { name: 'Добавить объявление' })
    );
    await userEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => {
      expect(screen.getByText('Новое')).toBeInTheDocument();
    });

    const postCall = mockRequest.mock.calls.find(
      ([, opts]) => (opts as { method?: string })?.method === 'POST'
    );
    expect(postCall).toBeDefined();
    const body = (postCall![1] as { body: Record<string, unknown> }).body;
    expect(body).toMatchObject({
      name: 'Новое',
      price: 100,
      imageUrl: 'img.png',
      description: 'desc',
      views: 0,
      likes: 0
    });
  });

  it('закрывает модалку после отправки формы', async () => {
    mockRequest
      .mockResolvedValueOnce(paginated([]))
      .mockResolvedValueOnce(makeAd('2', 'Новое'));

    render(<Catalog />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Добавить объявление' })
    );
    expect(screen.getByTestId('modal-form-add')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => {
      expect(screen.queryByTestId('modal-form-add')).not.toBeInTheDocument();
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

    const { unmount } = render(<Catalog />);
    await waitFor(() => expect(capturedSignal).toBeDefined());

    unmount();

    expect(capturedSignal!.aborted).toBe(true);
  });

  it('игнорирует AbortError (не логирует)', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockRequest.mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    render(<Catalog />);
    await waitFor(() => expect(mockRequest).toHaveBeenCalled());

    expect(errSpy).not.toHaveBeenCalled();
  });

  it('логирует обычную ошибку через console.error', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockRequest.mockRejectedValue(new Error('Network fail'));

    render(<Catalog />);
    await waitFor(() => expect(errSpy).toHaveBeenCalledWith('Network fail'));
  });

  it('логирует не-Error значение через console.error', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockRequest.mockRejectedValue('строковая ошибка');

    render(<Catalog />);
    await waitFor(() =>
      expect(errSpy).toHaveBeenCalledWith('строковая ошибка')
    );
  });

  it('логирует ошибку POST через console.log', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockRequest
      .mockResolvedValueOnce(paginated([]))
      .mockRejectedValueOnce(new Error('POST fail'));

    render(<Catalog />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Добавить объявление' })
    );
    await userEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => expect(logSpy).toHaveBeenCalled());
  });
});

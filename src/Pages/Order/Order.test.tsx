import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Order as OrderType } from '@types';

let mockSearchParams = new URLSearchParams();
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [mockSearchParams, vi.fn()]
}));

const mockRequest = vi.fn();
vi.mock('@/Shared/Hooks/useFetch', () => ({
  Request: (...args: unknown[]) => mockRequest(...args)
}));

vi.mock('@/App/Providers/OrderContext', () => ({
  useOrderFilter: () => ({
    priceSort: 'asc',
    status: -1,
    maxAdsPerPage: 10
  })
}));

vi.mock('@/Widgets/OrderItem', () => ({
  OrderItem: ({ orderItem }: { orderItem: OrderType }) => (
    <div data-testid="order-item">Заказ {orderItem.id}</div>
  )
}));
vi.mock('@/Widgets/OrderFilters', () => ({
  OrderFilters: () => <div data-testid="order-filters" />
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

import { Order } from './index';

function makeOrder(id: string, itemIds: string[]): OrderType {
  return {
    id,
    status: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    items: itemIds.map(
      (itemId) =>
        ({
          id: itemId,
          name: `Товар ${itemId}`,
          price: 100,
          count: 1
          // остальные поля Advertisment заполните минимально
        }) as OrderType['items'][number]
    ),
    deliveryWay: 'СДЭК',
    total: 100
  };
}

function paginated(data: OrderType[], pages = 1) {
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
  mockSearchParams = new URLSearchParams();
});

describe('Order page', () => {
  it('загружает заказы и рендерит список', async () => {
    mockRequest.mockResolvedValue(
      paginated([makeOrder('1', ['a']), makeOrder('2', ['b'])])
    );

    render(<Order />);

    expect(await screen.findByText('Заказ 1')).toBeInTheDocument();
    expect(screen.getByText('Заказ 2')).toBeInTheDocument();
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('передаёт в Request _page, _per_page и _sort', async () => {
    mockRequest.mockResolvedValue(paginated([]));
    render(<Order />);

    await waitFor(() => expect(mockRequest).toHaveBeenCalled());

    const url = mockRequest.mock.calls[0][0] as string;
    expect(url).toContain('_page=1');
    expect(url).toContain('_per_page=10');
    expect(url).toContain('_sort=total');
  });

  it('фильтрует заказы по adId из query-строки', async () => {
    mockSearchParams = new URLSearchParams('adId=a');
    mockRequest.mockResolvedValue(
      paginated([
        makeOrder('1', ['a']),
        makeOrder('2', ['b']),
        makeOrder('3', ['a', 'c'])
      ])
    );

    render(<Order />);

    expect(await screen.findByText('Заказ 1')).toBeInTheDocument();
    expect(screen.getByText('Заказ 3')).toBeInTheDocument();
    expect(screen.queryByText('Заказ 2')).not.toBeInTheDocument();
  });

  it('показывает пустой список, если по adId ничего не найдено', async () => {
    mockSearchParams = new URLSearchParams('adId=zzz');
    mockRequest.mockResolvedValue(paginated([makeOrder('1', ['a'])]));

    render(<Order />);

    await waitFor(() => expect(mockRequest).toHaveBeenCalled());
    expect(screen.queryByTestId('order-item')).not.toBeInTheDocument();
  });

  it('рендерит кнопки пагинации по количеству pages', async () => {
    mockRequest.mockResolvedValue(paginated([makeOrder('1', ['a'])], 3));
    render(<Order />);

    expect(
      await screen.findByRole('button', { name: '1' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
  });

  it('по клику на страницу делает новый запрос с _page', async () => {
    mockRequest.mockResolvedValue(paginated([makeOrder('1', ['a'])], 3));
    render(<Order />);

    await screen.findByRole('button', { name: '2' });
    await userEvent.click(screen.getByRole('button', { name: '2' }));

    await waitFor(() => {
      const lastUrl = mockRequest.mock.calls.at(-1)?.[0] as string;
      expect(lastUrl).toContain('_page=2');
    });
  });

  it('отменяет запрос при размонтировании (AbortController)', async () => {
    let capturedSignal: AbortSignal | undefined;

    mockRequest.mockImplementation((_url, opts?: { signal?: AbortSignal }) => {
      capturedSignal = opts?.signal;
      return new Promise((_resolve, reject) => {
        opts?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError'))
        );
      });
    });

    const { unmount } = render(<Order />);
    await waitFor(() => expect(capturedSignal).toBeDefined());

    unmount();

    expect(capturedSignal!.aborted).toBe(true);
  });

  it('игнорирует AbortError (не логирует)', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockRequest.mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    render(<Order />);

    await waitFor(() => expect(mockRequest).toHaveBeenCalled());
    expect(errSpy).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });
});

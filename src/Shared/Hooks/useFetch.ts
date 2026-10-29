type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function Request<T = unknown>(
  url: string,
  { method = 'GET', body, headers, signal }: RequestOptions = {}
): Promise<T> {
  const isBodyAllowed = method !== 'GET';
  const res = await fetch(url, {
    method,
    signal,
    headers: {
      ...(isBodyAllowed && body !== undefined
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...headers
    },
    body: isBodyAllowed && body !== undefined ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(
      `HTTP ${res.status} ${res.statusText}${errorBody ? `: ${errorBody}` : ''}`
    );
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

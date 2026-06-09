export async function fetchJson<T>(
    url: string,
    options: RequestInit = {},
): Promise<T> {
    const { headers, ...restOptions } = options;

    const response = await fetch(url, {
        ...restOptions,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(headers || {}),
        },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const validationMessage =
            data?.errors && typeof data.errors === 'object'
                ? Object.values(data.errors).flat().join(' ')
                : null;

        const message = validationMessage || data?.message || 'Request failed';

        throw new Error(message);
    }

    return data as T;
}

export function getCsrfToken(): string {
    const token = document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content');

    return token || '';
}

export async function postJson<T>(
    url: string,
    body: unknown,
    options: RequestInit = {},
): Promise<T> {
    const { headers, ...restOptions } = options;

    return fetchJson<T>(url, {
        ...restOptions,
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
            ...(headers || {}),
        },
    });
}

export async function patchJson<T>(
    url: string,
    body: unknown,
    options: RequestInit = {},
): Promise<T> {
    const { headers, ...restOptions } = options;

    return fetchJson<T>(url, {
        ...restOptions,
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
            ...(headers || {}),
        },
    });
}

export async function deleteJson<T>(
    url: string,
    options: RequestInit = {},
): Promise<T> {
    const { headers, ...restOptions } = options;

    return fetchJson<T>(url, {
        ...restOptions,
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
            ...(headers || {}),
        },
    });
}
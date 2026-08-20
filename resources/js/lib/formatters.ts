export function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export function formatCurrency(value: number | string | null | undefined): string {
    const amount = typeof value === 'string' ? Number(value) : value;

    if (amount === null || amount === undefined || !Number.isFinite(amount)) {
        return '—';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(
    value: string | null | undefined,
    options: Intl.DateTimeFormatOptions = { dateStyle: 'long' },
): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        ...options,
    }).format(date);
}

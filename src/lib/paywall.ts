import { getSecret } from 'astro:env/server';

const timeZone = 'Europe/Prague';
const pragueDate = new Intl.DateTimeFormat('en', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});
const czechDate = new Intl.DateTimeFormat('cs-CZ', {
    timeZone: 'UTC',
    dateStyle: 'long',
});

export const readerCodeCookie = 'pritel_reader_code';
export const downloadQuery = 'download';

function todayInPrague(now: Date) {
    const parts = pragueDate.formatToParts(now);
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === type)?.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
}

export function issuePaywall(publishedAt: string, now = new Date()) {
    const start = getSecret('PAYWALL_START')?.trim();
    if (!start) return null;

    const parsedStart = new Date(start);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) ||
        Number.isNaN(parsedStart.valueOf()) || parsedStart.toISOString().slice(0, 10) !== start) {
        throw new Error('PAYWALL_START must be a valid YYYY-MM-DD date');
    }

    const issueDate = publishedAt.slice(0, 10);
    if (issueDate < start) return null;

    const [year, month] = issueDate.split('-').map(Number);
    const opensOn = new Date(Date.UTC(year, month + 2, 1));
    if (todayInPrague(now) >= opensOn.toISOString().slice(0, 10)) return null;

    return { opensOn: czechDate.format(opensOn) };
}

export function normalizeReaderCode(value: unknown) {
    if (typeof value !== 'string' || value.length > 40) return undefined;
    const code = value.replace(/[-\s]/g, '').toUpperCase();
    if (/^[A-F0-9]{20}$/.test(code)) return code;
}

export async function isActiveReaderCode(code: string | undefined) {
    if (!code) return false;

    const url = getSecret('KV_REST_API_URL');
    const token = getSecret('KV_REST_API_READ_ONLY_TOKEN');
    if (!url || !token) throw new Error('Paywall code store is unavailable');

    const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(['HGET', 'pritel:reader-codes:v1', code]),
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error('Paywall code lookup failed');

    const { result, error } = await response.json();
    if (error || result === undefined) throw new Error('Paywall code lookup failed');
    if (result === null) return false;

    return JSON.parse(result).year === Number(todayInPrague(new Date()).slice(0, 4));
}

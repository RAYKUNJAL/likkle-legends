const AZURACAST_BASE_URL = process.env.AZURACAST_BASE_URL?.trim() || '';
const AZURACAST_API_KEY = process.env.AZURACAST_API_KEY?.trim() || '';

function getHeaders() {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (AZURACAST_API_KEY) {
        headers.Authorization = `Bearer ${AZURACAST_API_KEY}`;
        headers['X-API-Key'] = AZURACAST_API_KEY;
    }
    return headers;
}

export function isAzuraCastConfigured() {
    return Boolean(AZURACAST_BASE_URL);
}

export async function fetchAzuraCast(path: string) {
    if (!isAzuraCastConfigured()) {
        throw new Error('AzuraCast is not configured.');
    }

    const url = `${AZURACAST_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
    const res = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error(`AzuraCast request failed (${res.status})`);
    }

    return res.json();
}

export async function getNowPlaying(stationShortcode?: string) {
    if (stationShortcode) {
        return fetchAzuraCast(`/api/nowplaying/${stationShortcode}`);
    }
    return fetchAzuraCast('/api/nowplaying');
}


import crypto from 'crypto';

const DEFAULT_API_BASE = 'https://discoveryengine.googleapis.com/v1alpha';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CLOUD_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';

function getEnv(name: string): string | null {
    const value = process.env[name];
    if (!value || !value.trim()) return null;
    return value.trim();
}

function ensureParentResource(overrideParent?: string): string {
    const parent = overrideParent || getEnv('NOTEBOOKLM_PARENT');
    if (!parent) {
        throw new Error('NOTEBOOKLM_PARENT is missing');
    }
    return parent.replace(/^\/+/, '');
}

function buildApiBase(): string {
    return (getEnv('NOTEBOOKLM_API_BASE') || DEFAULT_API_BASE).replace(/\/+$/, '');
}

function normalizeResourceName(parent: string, notebookIdOrName: string): string {
    const clean = notebookIdOrName.replace(/^\/+/, '');
    if (clean.includes('/')) return clean;
    return `${parent}/notebooks/${clean}`;
}

function createServiceAccountAssertion(clientEmail: string, privateKey: string): string {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
        iss: clientEmail,
        scope: CLOUD_SCOPE,
        aud: TOKEN_URL,
        iat: now,
        exp: now + 3600,
    };

    const encode = (obj: unknown) =>
        Buffer.from(JSON.stringify(obj)).toString('base64url');

    const unsignedToken = `${encode(header)}.${encode(payload)}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(unsignedToken);
    signer.end();
    const signature = signer.sign(privateKey, 'base64url');
    return `${unsignedToken}.${signature}`;
}

async function getAccessToken(): Promise<string> {
    const staticToken =
        getEnv('NOTEBOOKLM_BEARER_TOKEN') ||
        getEnv('GOOGLE_ACCESS_TOKEN');
    if (staticToken) return staticToken;

    const clientEmail = getEnv('GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL');
    const privateKeyRaw = getEnv('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
    if (!clientEmail || !privateKeyRaw) {
        throw new Error(
            'Missing Google auth credentials. Set NOTEBOOKLM_BEARER_TOKEN or service account env vars.'
        );
    }

    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
    const assertion = createServiceAccountAssertion(clientEmail, privateKey);
    const body = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
    });

    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OAuth token exchange failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    if (!data.access_token) {
        throw new Error('OAuth token exchange failed: missing access_token');
    }

    return data.access_token as string;
}

async function notebooklmFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getAccessToken();
    const base = buildApiBase();
    const url = `${base}/${path.replace(/^\/+/, '')}`;

    const response = await fetch(url, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
        },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
        const message = data?.error?.message || `NotebookLM API error ${response.status}`;
        throw new Error(message);
    }
    return data as T;
}

export interface NotebookRecord {
    name?: string;
    displayName?: string;
    [key: string]: unknown;
}

export interface NotebookSourceRecord {
    name?: string;
    uri?: string;
    [key: string]: unknown;
}

export async function listNotebooks(parentOverride?: string) {
    const parent = ensureParentResource(parentOverride);
    return notebooklmFetch<{ notebooks?: NotebookRecord[]; [key: string]: unknown }>(
        `${parent}/notebooks`
    );
}

export async function createNotebook(
    input: { displayName: string; description?: string; notebookId?: string; metadata?: Record<string, unknown> },
    parentOverride?: string
) {
    const parent = ensureParentResource(parentOverride);
    const query = input.notebookId ? `?notebookId=${encodeURIComponent(input.notebookId)}` : '';
    const body = {
        notebook: {
            displayName: input.displayName,
            description: input.description,
            metadata: input.metadata || {},
        },
    };

    return notebooklmFetch<NotebookRecord>(`${parent}/notebooks${query}`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export async function deleteNotebook(notebookIdOrName: string, parentOverride?: string) {
    const parent = ensureParentResource(parentOverride);
    const resource = normalizeResourceName(parent, notebookIdOrName);
    return notebooklmFetch<Record<string, unknown>>(resource, { method: 'DELETE' });
}

export async function listNotebookSources(notebookIdOrName: string, parentOverride?: string) {
    const parent = ensureParentResource(parentOverride);
    const resource = normalizeResourceName(parent, notebookIdOrName);
    return notebooklmFetch<{ sources?: NotebookSourceRecord[]; [key: string]: unknown }>(
        `${resource}/sources`
    );
}

export async function addNotebookSource(
    notebookIdOrName: string,
    input: { uri: string; title?: string; mimeType?: string; sourceType?: string },
    parentOverride?: string
) {
    const parent = ensureParentResource(parentOverride);
    const resource = normalizeResourceName(parent, notebookIdOrName);
    const body = {
        source: {
            uri: input.uri,
            title: input.title,
            mimeType: input.mimeType,
            sourceType: input.sourceType || 'WEB',
        },
    };
    return notebooklmFetch<NotebookSourceRecord>(`${resource}/sources`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export function getNotebookLMSetupStatus() {
    return {
        apiBase: buildApiBase(),
        hasParent: Boolean(getEnv('NOTEBOOKLM_PARENT')),
        hasBearerToken: Boolean(getEnv('NOTEBOOKLM_BEARER_TOKEN') || getEnv('GOOGLE_ACCESS_TOKEN')),
        hasServiceAccount: Boolean(
            getEnv('GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL') &&
            getEnv('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
        ),
    };
}

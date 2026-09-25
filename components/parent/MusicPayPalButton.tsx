'use client';

import { PayPalButtons } from '@paypal/react-paypal-js';

async function readJson(response: Response): Promise<Record<string, unknown>> {
    return response.json().catch(() => ({}));
}

export default function MusicPayPalButton({
    sku,
    token,
    trackId,
    requestId,
    onVerified,
}: {
    sku: string;
    token?: string | null;
    trackId?: string;
    requestId?: string;
    onVerified: () => void;
}) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    return (
        <PayPalButtons
            style={{ layout: 'vertical', shape: 'rect', label: 'pay' }}
            createOrder={async () => {
                const response = await fetch('/api/payments/paypal/create-order', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers,
                    body: JSON.stringify({ sku, trackId, requestId }),
                });
                const body = await readJson(response);
                if (!response.ok || typeof body.id !== 'string') {
                    throw new Error(typeof body.error === 'string' ? body.error : 'Checkout is unavailable');
                }
                return body.id;
            }}
            onApprove={async (data) => {
                const response = await fetch('/api/payments/paypal/capture-order', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers,
                    body: JSON.stringify({ orderID: data.orderID, sku }),
                });
                const body = await readJson(response);
                if (!response.ok || body.entitled !== true) {
                    throw new Error(typeof body.error === 'string' ? body.error : 'Payment was not verified. Nothing was unlocked.');
                }
                onVerified();
            }}
        />
    );
}

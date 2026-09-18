const SANDBOX = process.env.PAYPAL_ENV === 'sandbox' || process.env.NODE_ENV !== 'production';

export function getPayPalApiBase() {
    return SANDBOX ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
}

export async function getPayPalAccessToken(): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error('PayPal credentials are not configured');
    }
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    const data = await res.json() as { access_token?: string; error_description?: string };
    if (!res.ok || !data.access_token) {
        throw new Error(data.error_description || 'Could not authenticate with PayPal');
    }
    return data.access_token;
}

export type PayPalOrderSnapshot = {
    id?: string;
    status?: string;
    amount?: number;
    captureId?: string;
};

export async function fetchPayPalOrder(orderId: string): Promise<PayPalOrderSnapshot> {
    const token = await getPayPalAccessToken();
    const res = await fetch(`${getPayPalApiBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`PayPal order lookup failed (${res.status}) ${body.slice(0, 180)}`);
    }
    const data = await res.json() as {
        id?: string;
        status?: string;
        purchase_units?: Array<{
            amount?: { value?: string };
            payments?: { captures?: Array<{ id?: string; status?: string; amount?: { value?: string } }> };
        }>;
    };
    const unit = data.purchase_units?.[0];
    const capture = unit?.payments?.captures?.find((item) => item.status === 'COMPLETED') || unit?.payments?.captures?.[0];
    const rawAmount = capture?.amount?.value || unit?.amount?.value;
    return {
        id: data.id,
        status: data.status,
        amount: rawAmount != null ? parseFloat(rawAmount) : undefined,
        captureId: capture?.id,
    };
}

export async function capturePayPalOrder(orderId: string): Promise<PayPalOrderSnapshot> {
    const token = await getPayPalAccessToken();
    const res = await fetch(`${getPayPalApiBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    const data = await res.json() as {
        id?: string;
        status?: string;
        purchase_units?: Array<{
            payments?: { captures?: Array<{ id?: string; status?: string; amount?: { value?: string } }> };
        }>;
        message?: string;
    };
    if (!res.ok) {
        throw new Error(data.message || `PayPal capture failed (${res.status})`);
    }
    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
    return {
        id: data.id,
        status: data.status,
        amount: capture?.amount?.value != null ? parseFloat(capture.amount.value) : undefined,
        captureId: capture?.id,
    };
}

export async function createPayPalCatalogOrder(opts: {
    productId: string;
    productName: string;
    price: number;
    customId: string;
    description?: string;
}): Promise<{ id: string; status?: string }> {
    const token = await getPayPalAccessToken();
    const res = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: opts.price.toFixed(2),
                },
                description: opts.description || opts.productName,
                custom_id: opts.customId,
            }],
        }),
    });
    const order = await res.json() as { id?: string; status?: string; message?: string };
    if (!res.ok || !order.id) {
        throw new Error(order.message || 'Failed to create PayPal order');
    }
    return { id: order.id, status: order.status };
}

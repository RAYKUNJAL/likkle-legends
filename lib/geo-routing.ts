// Geo-routing and Fulfillment Logic
// Routes orders to Maryland (US) or Print-on-Demand (UK/Canada)

export type FulfillmentHub = 'maryland' | 'stannp_uk' | 'stannp_canada';

export interface GeoInfo {
    country: string;
    countryCode: string;
    currency: string;
    fulfillmentHub: FulfillmentHub;
}

// Detect country from IP using free API
export async function detectCountry(): Promise<GeoInfo> {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        return {
            country: data.country_name || 'United States',
            countryCode: data.country_code || 'US',
            currency: getCurrencyForCountry(data.country_code),
            fulfillmentHub: getFulfillmentHub(data.country_code),
        };
    } catch {
        // Default to US if detection fails
        return {
            country: 'United States',
            countryCode: 'US',
            currency: 'USD',
            fulfillmentHub: 'maryland',
        };
    }
}

function getCurrencyForCountry(countryCode: string): string {
    const currencyMap: Record<string, string> = {
        US: 'USD',
        GB: 'GBP',
        CA: 'CAD',
        // Caribbean countries use USD
        JM: 'USD', TT: 'USD', BB: 'USD', LC: 'USD', GD: 'USD',
        VC: 'USD', AG: 'USD', DM: 'USD', KN: 'USD', BS: 'USD',
        GY: 'USD', SR: 'USD', HT: 'USD', BZ: 'USD',
    };
    return currencyMap[countryCode] || 'USD';
}

function getFulfillmentHub(countryCode: string): FulfillmentHub {
    if (countryCode === 'GB') return 'stannp_uk';
    if (countryCode === 'CA') return 'stannp_canada';
    // US and Caribbean ship from Maryland
    return 'maryland';
}

// Stannp API for UK/Canada Print-on-Demand
const STANNP_API_KEY = process.env.STANNP_API_KEY || '';
const STANNP_API_URL = 'https://dash.stannp.com/api/v1';

export interface MailOrder {
    recipientName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    templateId: string;
    customFields?: Record<string, string>;
}

export async function sendStannpMail(order: MailOrder): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!STANNP_API_KEY) {
        return { success: false, error: 'Stannp API key not configured' };
    }

    try {
        const response = await fetch(`${STANNP_API_URL}/letters/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(STANNP_API_KEY + ':').toString('base64')}`,
            },
            body: JSON.stringify({
                test: process.env.NODE_ENV !== 'production',
                template: order.templateId,
                recipient: {
                    title: '',
                    firstname: order.recipientName.split(' ')[0],
                    lastname: order.recipientName.split(' ').slice(1).join(' ') || '',
                    address1: order.addressLine1,
                    address2: order.addressLine2 || '',
                    city: order.city,
                    postcode: order.postalCode,
                    country: order.country,
                },
                ...order.customFields,
            }),
        });

        const data = await response.json();

        if (data.success) {
            return { success: true, id: data.data.id };
        } else {
            return { success: false, error: data.error || 'Unknown error' };
        }
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

// Google Sheets integration for Maryland fulfillment
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY || '';
const FULFILLMENT_SHEET_ID = process.env.FULFILLMENT_SHEET_ID || '';

export interface FulfillmentOrder {
    orderId: string;
    customerName: string;
    email: string;
    tier: string;
    address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    childName: string;
    childAge: number;
    selectedIsland: string;
    createdAt: string;
}

export async function addToFulfillmentSheet(order: FulfillmentOrder): Promise<boolean> {
    // This would use Google Sheets API - for now returns mock success
    // In production, use googleapis package or server action
    console.log('Adding to fulfillment sheet:', order);
    return true;
}

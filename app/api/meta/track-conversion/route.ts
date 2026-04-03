/**
 * Meta Conversions API Route
 * Server-side event tracking for payment conversions
 * More reliable than client-side pixel for measuring $10k+/month scaling
 * 
 * Used for: Purchase events, matched against PayPal webhook data
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface ConversionRequest {
  event_name: string;
  user_email?: string;
  user_phone?: string;
  value: number;
  currency: string;
  content_name?: string;
  content_type?: string;
  user_id?: string;
  fbc?: string; // Facebook Click ID from fbq
  fbp?: string; // Facebook Pixel ID
  client_ip_address?: string;
  client_user_agent?: string;
}

interface ConversionAPIEvent {
  event_name: string;
  event_time: number;
  action_source: 'website';
  event_id: string;
  user_data: {
    em?: string;
    ph?: string;
    ge?: string; // Gender (hashed)
    db?: string; // Date of birth (hashed)
    ln?: string; // Last name (hashed)
    fn?: string; // First name (hashed)
    ct?: string; // City (hashed)
    st?: string; // State (hashed)
    zp?: string; // Zip code (hashed)
    country?: string; // Country (hashed)
    external_id?: string;
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
  };
  event_source_url?: string;
  custom_data?: {
    value: number;
    currency: string;
    content_name?: string;
    content_type?: string;
  };
}

/**
 * Hash data using SHA-256 for Meta Conversions API
 * Meta requires hashed PII for user matching
 */
function hashValue(value: string): string {
  if (!value) return '';
  // Trim, lowercase, remove whitespace
  const normalized = value.trim().toLowerCase().replace(/\s/g, '');
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Validate conversion event
 */
function validateEvent(body: ConversionRequest): {
  valid: boolean;
  error?: string;
} {
  if (!body.event_name) {
    return { valid: false, error: 'event_name is required' };
  }

  if (!body.value || body.value < 0) {
    return { valid: false, error: 'value must be a positive number' };
  }

  if (!body.currency) {
    return { valid: false, error: 'currency is required' };
  }

  if (!body.user_email && !body.user_phone && !body.user_id) {
    return {
      valid: false,
      error: 'At least one of user_email, user_phone, or user_id is required',
    };
  }

  return { valid: true };
}

/**
 * Format event for Meta Conversions API
 */
function formatConversionEvent(
  request: ConversionRequest,
  clientIpAddress?: string,
  userAgent?: string
): ConversionAPIEvent {
  const eventId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const userData: ConversionAPIEvent['user_data'] = {
    client_ip_address: clientIpAddress,
    client_user_agent: userAgent,
  };

  // Hash email if provided
  if (request.user_email) {
    userData.em = hashValue(request.user_email);
  }

  // Hash phone if provided
  if (request.user_phone) {
    userData.ph = hashValue(request.user_phone);
  }

  // External ID (user_id)
  if (request.user_id) {
    userData.external_id = request.user_id;
  }

  // Facebook identifiers
  if (request.fbc) {
    userData.fbc = request.fbc;
  }
  if (request.fbp) {
    userData.fbp = request.fbp;
  }

  return {
    event_name: request.event_name,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_id: eventId,
    user_data: userData,
    custom_data: {
      value: request.value,
      currency: request.currency,
      content_name: request.content_name,
      content_type: request.content_type,
    },
  };
}

/**
 * Send event to Meta Conversions API
 */
async function sendToMetaConversionsAPI(
  event: ConversionAPIEvent,
  pixelId: string,
  accessToken: string
): Promise<{ success: boolean; error?: string; response?: any }> {
  try {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events`;

    const payload = {
      data: [event],
      test_event_code: process.env.META_TEST_EVENT_CODE, // Optional: for testing
      access_token: accessToken,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: `Meta API error: ${data.error?.message || 'Unknown error'}`,
        response: data,
      };
    }

    return { success: true, response: data };
  } catch (error) {
    return {
      success: false,
      error: `Failed to send to Meta: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * POST /api/meta/track-conversion
 * 
 * Request body:
 * {
 *   "event_name": "Purchase",
 *   "user_email": "parent@example.com",
 *   "user_phone": "+1234567890",
 *   "value": 9.99,
 *   "currency": "USD",
 *   "content_name": "Monthly Subscription",
 *   "content_type": "subscription"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP and user agent
    const clientIpAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      '';

    const userAgent = request.headers.get('user-agent') || '';

    // Parse request body
    const body = await request.json();

    // Validate event
    const validation = validateEvent(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Get credentials from environment
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
      console.error('[Meta Conversions API] Missing credentials');
      return NextResponse.json(
        {
          success: false,
          error: 'Meta Conversions API not configured',
        },
        { status: 500 }
      );
    }

    // Format event for Meta API
    const event = formatConversionEvent(body, clientIpAddress, userAgent);

    // Send to Meta Conversions API
    const result = await sendToMetaConversionsAPI(
      event,
      pixelId,
      accessToken
    );

    if (!result.success) {
      console.error('[Meta Conversions API] Error:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Log successful conversion
    console.log(
      `[Meta Conversions API] Event tracked: ${body.event_name}`,
      {
        value: body.value,
        currency: body.currency,
        email: body.user_email ? '***' : undefined,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Conversion tracked successfully',
      event_id: event.event_id,
    });
  } catch (error) {
    console.error('[Meta Conversions API] Request error:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/meta/track-conversion
 * Health check endpoint
 */
export async function GET() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const hasAccessToken = !!process.env.META_CONVERSIONS_API_ACCESS_TOKEN;

  return NextResponse.json({
    status: 'ready',
    pixelId: pixelId || 'NOT_CONFIGURED',
    accessTokenConfigured: hasAccessToken,
    message: 'Meta Conversions API endpoint is ready',
  });
}

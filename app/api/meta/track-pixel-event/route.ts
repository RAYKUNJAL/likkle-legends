import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
const META_API_TOKEN = process.env.META_API_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const { eventName, userData, eventData } = await request.json();

    if (!eventName) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    if (!FACEBOOK_PIXEL_ID || !META_API_TOKEN) {
      console.warn('Meta Pixel not fully configured');
      return NextResponse.json(
        { success: true, message: 'Event queued (Meta Pixel not configured)' },
        { status: 200 }
      );
    }

    // Send to Meta API
    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          user_data: userData || {},
          custom_data: eventData || {},
        },
      ],
    };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${FACEBOOK_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      console.error('Meta API error:', await response.text());
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Event tracked' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Meta pixel tracking error:', error);
    return NextResponse.json(
      { error: 'Tracking failed' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api/require-admin';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_AGENT_MODEL = process.env.GEMINI_AGENT_MODEL || 'gemini-2.0-flash';

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { system, message } = await req.json();

    if (!system || !message) {
      return NextResponse.json({ error: 'Missing agent briefing or message' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured for agent chat.' },
        { status: 503 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_AGENT_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: system }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: message }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || 'Gemini agent request failed' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      text: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.',
      model: GEMINI_AGENT_MODEL,
    });
  } catch (_e) {
    return NextResponse.json({ error: 'Agent chat failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getPortalCapabilities } from '@/lib/portal-capabilities';

export const dynamic = 'force-dynamic';

export async function GET() {
  const capabilities = getPortalCapabilities();
  return NextResponse.json({
    ...capabilities,
    voiceNote: 'Island Voice is turn-based: you speak, the buddy thinks, then it talks back. It is not live two-way calling.',
  });
}

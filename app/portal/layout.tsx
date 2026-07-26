import { NextRequest } from 'next/server';

// Force the entire portal route to be dynamically rendered — the portal page
// is a massive client component that overflows Next.js's static generation stack.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return children;
}

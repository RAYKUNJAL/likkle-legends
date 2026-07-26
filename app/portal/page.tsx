// Server component wrapper — prevents Next.js from trying to statically
// generate the massive portal client component (which overflows the stack).
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import PortalClient from './PortalClient';

export default function PortalPage() {
    return <PortalClient />;
}

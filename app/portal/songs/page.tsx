import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import SongsClient from './SongsClient';

export const dynamic = 'force-dynamic';

export default function SongsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-purple-50">
                <Loader2 className="animate-spin text-purple-600" size={48} />
            </div>
        }>
            <SongsClient />
        </Suspense>
    );
}

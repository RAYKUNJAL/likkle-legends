'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { parseCookies, setCookie } from 'nookies';

type GeoVariant = 'USA_MAIL_FIRST' | 'GLOBAL_DIGITAL_FIRST';

interface GeoContextType {
    variant: GeoVariant;
    setVariant: (variant: GeoVariant) => void;
    isLoading: boolean;
}

const GeoContext = createContext<GeoContextType | undefined>(undefined);

export function GeoProvider({ children }: { children: React.ReactNode }) {
    const [variant, setVariantState] = useState<GeoVariant>('GLOBAL_DIGITAL_FIRST');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const cookies = parseCookies();
        const savedPref = cookies['ll_location_pref'] as GeoVariant | undefined;

        if (savedPref && (savedPref === 'USA_MAIL_FIRST' || savedPref === 'GLOBAL_DIGITAL_FIRST')) {
            setVariantState(savedPref);
            setIsLoading(false);
        } else {
            // Attempt auto-detection via timezone as a proximity proxy if no cookie
            // In a real prod environment, we'd use a server-side header (Vercel-IP-Country)
            try {
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (tz.includes('America/') && !tz.includes('America/Toronto') && !tz.includes('America/Vancouver')) {
                    // Primitive check for USA-ish timezones
                    // This is a placeholder for more robust geo-IP logic
                    setVariantState('USA_MAIL_FIRST');
                }
            } catch (e) {
                console.error('Geo detection failed', e);
            }
            setIsLoading(false);
        }
    }, []);

    const setVariant = (newVariant: GeoVariant) => {
        setVariantState(newVariant);
        setCookie(null, 'll_location_pref', newVariant, {
            maxAge: 90 * 24 * 60 * 60, // 90 days
            path: '/',
        });
    };

    return (
        <GeoContext.Provider value={{ variant, setVariant, isLoading }}>
            {children}
        </GeoContext.Provider>
    );
}

export function useGeo() {
    const context = useContext(GeoContext);
    if (context === undefined) {
        throw new Error('useGeo must be used within a GeoProvider');
    }
    return context;
}

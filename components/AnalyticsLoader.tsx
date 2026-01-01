"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { supabase } from '@/lib/storage';

interface AnalyticsConfig {
    facebook_pixel_id: string;
    google_analytics_id: string;
    tiktok_pixel_id: string;
}

export default function AnalyticsLoader() {
    const pathname = usePathname();
    const [config, setConfig] = useState<AnalyticsConfig | null>(null);
    const [consentGiven, setConsentGiven] = useState(false);

    // CRITICAL: COPPA/GDPR-K Compliance
    // Never load tracking scripts in child-directed areas
    const isChildArea = pathname?.startsWith('/portal') || pathname?.startsWith('/onboarding/child');

    if (isChildArea) return null;

    useEffect(() => {
        // 1. Check for initial consent
        const checkConsent = () => {
            const consent = localStorage.getItem('cookie_consent');
            if (consent === 'true') {
                setConsentGiven(true);
            }
        };

        checkConsent();

        // 2. Listen for real-time updates from CookieBanner
        const handleConsentUpdate = () => {
            checkConsent();
        };

        window.addEventListener('cookie_consent_updated', handleConsentUpdate);

        return () => {
            window.removeEventListener('cookie_consent_updated', handleConsentUpdate);
        };
    }, []);

    useEffect(() => {
        // Only fetch settings if consent is given. 
        // This saves a DB call for users who decline or haven't decided.
        if (!consentGiven) return;

        const fetchSettings = async () => {
            try {
                const { data } = await supabase
                    .from('site_settings')
                    .select('value')
                    .eq('key', 'analytics')
                    .single();

                if (data?.value) {
                    setConfig({
                        facebook_pixel_id: data.value.facebook_pixel_id || '',
                        google_analytics_id: data.value.google_analytics_id || '',
                        tiktok_pixel_id: data.value.tiktok_pixel_id || '',
                    });
                }
            } catch (err) {
                console.error('Failed to load analytics settings', err);
            }
        };

        fetchSettings();
    }, [consentGiven]);

    // If no consent or no config, render nothing
    if (!consentGiven || !config) return null;

    return (
        <>
            {/* Google Analytics 4 */}
            {config.google_analytics_id && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${config.google_analytics_id}`}
                        strategy="afterInteractive"
                    />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`
                          window.dataLayer = window.dataLayer || [];
                          function gtag(){dataLayer.push(arguments);}
                          gtag('js', new Date());
                          gtag('config', '${config.google_analytics_id}');
                        `}
                    </Script>
                </>
            )}

            {/* Facebook Pixel */}
            {config.facebook_pixel_id && (
                <Script id="facebook-pixel" strategy="afterInteractive">
                    {`
                      !function(f,b,e,v,n,t,s)
                      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                      n.queue=[];t=b.createElement(e);t.async=!0;
                      t.src=v;s=b.getElementsByTagName(e)[0];
                      s.parentNode.insertBefore(t,s)}(window, document,'script',
                      'https://connect.facebook.net/en_US/fbevents.js');
                      fbq('init', '${config.facebook_pixel_id}');
                      fbq('track', 'PageView');
                    `}
                </Script>
            )}

            {/* TikTok Pixel */}
            {config.tiktok_pixel_id && (
                <Script id="tiktok-pixel" strategy="afterInteractive">
                    {`
                      !function (w, d, t) {
                        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
                        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
                        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
                        ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
                        ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
                        var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
                        var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                        ttq.load('${config.tiktok_pixel_id}');
                        ttq.page();
                      }(window, document, 'ttq');
                    `}
                </Script>
            )}
        </>
    );
}

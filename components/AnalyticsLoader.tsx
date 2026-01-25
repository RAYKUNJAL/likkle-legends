"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { supabase } from '@/lib/storage';

interface AnalyticsConfig {
    facebook_pixel_id: string;
    google_analytics_id: string;
    tiktok_pixel_id: string;
    snapchat_pixel_id?: string;
    google_tag_manager_id?: string;
    meta_verification_code?: string;
}

export default function AnalyticsLoader() {
    const pathname = usePathname();
    const [config, setConfig] = useState<AnalyticsConfig | null>(null);
    const [consentGiven, setConsentGiven] = useState(false);

    // CRITICAL: COPPA/GDPR-K Compliance
    const isChildArea = pathname?.startsWith('/portal') || pathname?.startsWith('/onboarding/child');

    useEffect(() => {
        const checkConsent = () => {
            const consent = localStorage.getItem('likkle_cookie_consent');
            if (consent === 'true') setConsentGiven(true);
        };
        checkConsent();
        window.addEventListener('likkle_cookie_consent_updated', checkConsent);
        return () => window.removeEventListener('likkle_cookie_consent_updated', checkConsent);
    }, []);

    useEffect(() => {
        if (!consentGiven) return;
        const fetchSettings = async () => {
            try {
                const { data } = await supabase.from('site_settings').select('value').eq('key', 'analytics').single();
                if (data?.value) setConfig(data.value);
            } catch (err) {
                console.error('Failed to load analytics settings', err);
            }
        };
        fetchSettings();
    }, [consentGiven]);

    if (isChildArea) return null;
    if (!consentGiven || !config) return null;

    return (
        <>
            {/* Meta Verification */}
            {config.meta_verification_code && (
                <meta name="facebook-domain-verification" content={config.meta_verification_code} />
            )}

            {/* Google Tag Manager */}
            {config.google_tag_manager_id && (
                <Script id="google-tag-manager" strategy="afterInteractive">
                    {`
                        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                        })(window,document,'script','dataLayer','${config.google_tag_manager_id}');
                    `}
                </Script>
            )}

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

            {/* Snapchat Pixel */}
            {config.snapchat_pixel_id && (
                <Script id="snapchat-pixel" strategy="afterInteractive">
                    {`
                        (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
                        {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
                        a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;
                        r.src=n;var i=t.getElementsByTagName(s)[0];
                        i.parentNode.insertBefore(r,i)})(window,document,
                        'https://sc-static.net/scevent.min.js');
                        snaptr('init', '${config.snapchat_pixel_id}');
                        snaptr('track', 'PAGE_VIEW');
                    `}
                </Script>
            )}
        </>
    );
}

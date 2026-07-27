import { ImageResponse } from 'next/og';
import { SITE_URL } from '@/lib/offer-tracking';

export const runtime = 'edge';
export const alt =
    'Caribbean Learning That Feels Like Home — Likkle Legends';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Character image filenames — kept in sync with the /offer hero.
const CHARACTER_IMAGES = [
    'dilly-doubles.jpg',
    'tanty_spice_avatar.jpg',
    'roti-new.jpg',
    'scorcha_pepper.jpg',
    'mango_moko.png',
];

/**
 * Dynamically composed OG share image for the /offer funnel.
 *
 * Fetches the five character photos from /public/images and composes them
 * in a row on a Caribbean-gradient background with the brand title. Used by
 * the openGraph metadata on /offer, /offer/checkout, /offer/upsell,
 * /offer/thank-you.
 *
 * Route: /offer/og-image
 */
export default async function OfferOGImage() {
    const images = await Promise.all(
        CHARACTER_IMAGES.map(async (filename) => {
            const src = `${SITE_URL}/images/${filename}`;
            try {
                const res = await fetch(src, { cache: 'force-cache' });
                if (!res.ok) throw new Error(`fetch failed ${res.status}`);
                const buffer = await res.arrayBuffer();
                return buffer;
            } catch {
                // On fetch failure, fall back to a transparent 1x1 png so
                // the OG image still renders without that one avatar.
                return null;
            }
        })
    );

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                        'linear-gradient(135deg, #FF6B35 0%, #FFB627 50%, #10b981 100%)',
                    fontFamily: 'sans-serif',
                    padding: 60,
                }}
            >
                {/* Title block */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginBottom: 40,
                    }}
                >
                    <div
                        style={{
                            fontSize: 24,
                            fontWeight: 800,
                            color: 'rgba(255,255,255,0.85)',
                            textTransform: 'uppercase',
                            letterSpacing: 4,
                            marginBottom: 12,
                        }}
                    >
                        For Caribbean Families Abroad
                    </div>
                    <div
                        style={{
                            fontSize: 64,
                            fontWeight: 900,
                            color: 'white',
                            textAlign: 'center',
                            lineHeight: 1.05,
                            maxWidth: 1000,
                            textShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        }}
                    >
                        Caribbean Learning That Feels Like Home
                    </div>
                    <div
                        style={{
                            fontSize: 30,
                            color: 'rgba(255,255,255,0.95)',
                            marginTop: 18,
                            fontWeight: 600,
                        }}
                    >
                        Stories, phonics &amp; culture for kids 3–8
                    </div>
                </div>

                {/* Character photo row */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 20,
                    }}
                >
                    {images.map((img, i) => (
                        // next/og supports <img> with src as ArrayBuffer or data URL.
                        // Using objectFit cover via a wrapper.
                        <div
                            key={i}
                            style={{
                                width: 160,
                                height: 160,
                                borderRadius: 80,
                                overflow: 'hidden',
                                display: 'flex',
                                border: '4px solid white',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                                background: 'rgba(255,255,255,0.2)',
                            }}
                        >
                            {img ? (
                                <img
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore — next/og accepts ArrayBuffer src
                                    src={img as any}
                                    alt=""
                                    style={{
                                        width: 160,
                                        height: 160,
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 48,
                                    }}
                                >
                                    🌴
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Brand line */}
                <div
                    style={{
                        marginTop: 36,
                        fontSize: 28,
                        fontWeight: 800,
                        color: 'white',
                        letterSpacing: 1,
                    }}
                >
                    likklelegends.com
                </div>
            </div>
        ),
        size
    );
}

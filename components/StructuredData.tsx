export default function StructuredData() {
    const organizationData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Island City Tattoos",
        "url": "https://islandcitytattoos.com",
        "logo": "https://islandcitytattoos.com/icon.png",
        "sameAs": [
            "https://www.instagram.com/zaypaige/",
            "https://www.instagram.com/ray_tattoos/",
            "https://www.instagram.com/cookiemandtm_/"
        ],
        "description": "Custom tattoo studio in Baltimore offering cover-ups, flash tattoos, and design consultations."
    };

    const localBusinessData = {
        "@context": "https://schema.org",
        "@type": "TattooParlor",
        "name": "Island City Tattoos",
        "image": "https://islandcitytattoos.com/images/og-image.jpg",
        "description": "Book custom tattoo work, cover-ups, and flash offers in Baltimore.",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "5456 Park Heights Ave",
            "addressLocality": "Baltimore",
            "addressRegion": "MD",
            "postalCode": "21215",
            "addressCountry": "US"
        },
        "telephone": "+1-410-466-0555",
        "url": "https://islandcitytattoos.com"
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
            />
        </>
    );
}

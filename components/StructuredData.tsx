export default function StructuredData() {
    const organizationData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Likkle Legends",
        "url": "https://www.likklelegends.com",
        "logo": "https://www.likklelegends.com/images/logo.png",
        "sameAs": [
            "https://www.instagram.com/likklelegends",
            "https://twitter.com/likklelegends"
        ],
        "description": "Premium Caribbean-themed educational mail club for kids."
    };

    const productData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Likkle Legends Mail Club Subscription",
        "image": "https://www.likklelegends.com/images/hero.png",
        "description": "Monthly adventure boxes including character letters, Caribbean nursery songs, and interactive digital stories.",
        "brand": {
            "@type": "Brand",
            "name": "Likkle Legends"
        },
        "offers": {
            "@type": "Offer",
            "url": "https://www.likklelegends.com/#pricing",
            "priceCurrency": "USD",
            "price": "29.99",
            "availability": "https://schema.org/InStock"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productData) }}
            />
        </>
    );
}

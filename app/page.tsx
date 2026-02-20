import { Metadata } from 'next';
import LandingPage from '@/components/landing-v3/LandingPage';

export const metadata: Metadata = {
  title: "Likkle Legends | The #1 Caribbean Education Mail Club for Kids",
  description: "Join 500+ families raising proud, confident Caribbean kids. Monthly cultural letters, activities, and AI-powered stories for ages 4-9.",
  alternates: {
    canonical: 'https://likklelegends.com',
  },
  openGraph: {
    title: 'Likkle Legends | Caribbean Culture for Kids',
    description: 'Transform screen time into culture time. Personalized letters, island missions, and AI reading buddies.',
    url: 'https://likklelegends.com',
    siteName: 'Likkle Legends',
    images: [
      {
        url: 'https://likklelegends.com/images/roti-new.jpg', // Use absolute URL for OG images
        width: 1200,
        height: 630,
        alt: 'Likkle Legends - Caribbean Kids Education',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Likkle Legends - Raise Proud Caribbean Kids',
    description: 'The monthly mail club that brings island culture to your doorstep.',
    images: ['https://likklelegends.com/images/roti-new.jpg'],
  },
};

export default function Page() {
  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Likkle Legends",
    "url": "https://likklelegends.com",
    "logo": "https://likklelegends.com/images/logo.png",
    "sameAs": [
      "https://facebook.com/likklelegends",
      "https://instagram.com/likklelegends"
    ]
  };

  const jsonLdProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Likkle Legends Mail Club",
    "image": "https://likklelegends.com/images/roti-new.jpg",
    "description": "Monthly Caribbean culture & educational mail kit for children ages 4-9.",
    "brand": {
      "@type": "Brand",
      "name": "Likkle Legends"
    },
    "offers": {
      "@type": "Offer",
      "price": "10.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "https://likklelegends.com/pricing"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "542"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
      />
      <LandingPage />
    </>
  );
}

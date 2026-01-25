
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Likkle Legends',
        short_name: 'Likkle Legends',
        description: 'Raise Proud, Confident Caribbean Kids through personalized stories and cultural adventures.',
        start_url: '/',
        display: 'standalone',
        background_color: '#FFFDF7',
        theme_color: '#ff6b35',
        icons: [
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    };
}


import React from 'react';
import Image from 'next/image';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    containerClassName?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, containerClassName }) => {
    return (
        <div className={`relative overflow-hidden ${containerClassName}`}>
            <Image
                src={src}
                alt={alt}
                fill
                className={`object-cover transition-opacity duration-500 ${className}`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>
    );
};

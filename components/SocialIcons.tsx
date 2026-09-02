import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
    size?: number | string;
};

export function InstagramIcon({ size = 20, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

export function FacebookIcon({ size = 20, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="currentColor"
            aria-hidden="true"
            {...props}
        >
            <path d="M14 8.5V7.1c0-.67.45-.83.76-.83H17V3.1L13.9 3C10.83 3 9.96 5.3 9.96 6.78V8.5H8v3.57h1.96V21h3.74v-8.93h2.82l.38-3.57H13.7Z" />
        </svg>
    );
}

export function XIcon({ size = 20, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="currentColor"
            aria-hidden="true"
            {...props}
        >
            <path d="M17.53 3H20.5l-6.49 7.42L21.65 21h-5.98l-4.68-6.12L5.63 21H2.65l6.94-7.94L2.25 3h6.13l4.23 5.6L17.53 3Zm-1.04 16.14h1.64L7.49 4.76H5.73l10.76 14.38Z" />
        </svg>
    );
}

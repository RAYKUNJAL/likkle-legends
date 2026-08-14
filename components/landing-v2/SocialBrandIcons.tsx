import React from "react";

/**
 * Local brand marks for the homepage footer.
 *
 * lucide-react 1.x removed trademarked brand icons (Instagram, Twitter,
 * Facebook). Importing those names now yields `undefined`, which crashes
 * React with "Element type is invalid ... got: undefined" during homepage SSR.
 */
type BrandIconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function brandSvgProps({ size = 20, ...props }: BrandIconProps): React.SVGProps<SVGSVGElement> {
    return {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
        ...props,
    };
}

export function InstagramIcon(props: BrandIconProps) {
    return (
        <svg {...brandSvgProps(props)}>
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
    );
}

export function TwitterIcon(props: BrandIconProps) {
    return (
        <svg {...brandSvgProps(props)}>
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
    );
}

export function FacebookIcon(props: BrandIconProps) {
    return (
        <svg {...brandSvgProps(props)}>
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    );
}

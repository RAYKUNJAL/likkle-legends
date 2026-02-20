import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}", // Added src just in case
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: "var(--primary)",
                secondary: "var(--secondary)",
                accent: "var(--accent)",
                deep: "var(--deep)",
                border: "var(--border)",
                success: "var(--success)",

                // V3 Caribbean Palette
                'caribbean-sun': "var(--caribbean-sun)",
                'caribbean-ocean': "var(--caribbean-ocean)",
                'caribbean-mango': "var(--caribbean-mango)",
                'caribbean-lime': "var(--caribbean-lime)",
                'caribbean-sunset': "var(--caribbean-sunset)",
                'caribbean-sand': "var(--caribbean-sand)",
                'caribbean-palm': "var(--caribbean-palm)",
                'caribbean-spice': "var(--caribbean-spice)",
                'caribbean-sky': "var(--caribbean-sky)",
                'caribbean-papaya': "var(--caribbean-papaya)",
                'caribbean-turquoise': "var(--caribbean-turquoise)",
                'caribbean-coral': "var(--caribbean-coral)",
            },
            boxShadow: {
                'premium': '0 30px 60px -15px rgba(2, 48, 71, 0.1)',
                'premium-xl': '0 50px 100px -20px rgba(2, 48, 71, 0.15)',
                'gold': '0 20px 40px -10px rgba(255, 187, 0, 0.3)',
            },
            fontFamily: {
                sans: ["var(--font-quicksand)", "system-ui", "sans-serif"],
                mono: ["var(--font-geist-mono)"],
                heading: ["var(--font-fredoka)", "sans-serif"],
                montserrat: ["var(--font-montserrat)", "system-ui", "sans-serif"],
                // V3 Font Tokens
                main: ["var(--font-quicksand)", "sans-serif"],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'marquee': 'marquee 40s linear infinite',
                'wiggle': 'wiggle 1s ease-in-out infinite',
                'vocal-bounce': 'vocal-bounce 0.5s ease-in-out infinite',
                'neural-aura': 'neural-aura 3s ease-in-out infinite',
                'neural-halo': 'neural-halo 2s ease-in-out infinite',
                'message': 'message 0.4s ease-out forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                'vocal-bounce': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.15) translateY(-5px)' },
                },
                'neural-aura': {
                    '0%, 100%': { transform: 'scale(1) translate(-50%, -50%)', opacity: '0.2' },
                    '50%': { transform: 'scale(1.5) translate(-50%, -50%)', opacity: '0.4' },
                },
                'neural-halo': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(234, 179, 8, 0.4)' },
                    '70%': { boxShadow: '0 0 0 20px rgba(234, 179, 8, 0)' },
                },
                'message': {
                    '0%': { opacity: '0', transform: 'translateY(10px) scale(0.95)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;

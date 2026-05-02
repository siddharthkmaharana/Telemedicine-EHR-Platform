/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    theme: {
        extend: {
            fontFamily: {
                inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                xl: '16px',
                '2xl': '20px',
            },
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                teal: {
                    DEFAULT: '#00D9B8',
                    50: 'rgba(0,217,184,0.05)',
                    100: 'rgba(0,217,184,0.1)',
                    200: 'rgba(0,217,184,0.2)',
                    300: 'rgba(0,217,184,0.3)',
                    500: '#00D9B8',
                    600: '#00A89A',
                },
                violet: {
                    DEFAULT: '#7C3AED',
                    50: 'rgba(124,58,237,0.05)',
                    100: 'rgba(124,58,237,0.1)',
                    200: 'rgba(124,58,237,0.2)',
                    500: '#7C3AED',
                    600: '#6D28D9',
                },
                amber: {
                    DEFAULT: '#F59E0B',
                    50: 'rgba(245,158,11,0.05)',
                    100: 'rgba(245,158,11,0.1)',
                    200: 'rgba(245,158,11,0.2)',
                    500: '#F59E0B',
                    600: '#D97706',
                },
                surface: '#0E1525',
                elevated: '#151D2E',
                base: '#070B14',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                shimmer: 'shimmer 1.8s infinite',
                'fade-in': 'fade-in 0.35s ease-out',
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

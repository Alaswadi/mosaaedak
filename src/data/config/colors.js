// Color configuration for mosaaedak dashboard
// These colors are defined based on the design brief and match tailwind.config.js

export const colors = {
    // Primary palette (Green) - for brand, active states, success indicators
    primary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        950: '#052e16',
    },

    // Secondary palette (Orange) - for charts, CTAs
    secondary: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
        950: '#431407',
    },

    // Neutral palette for backgrounds and text
    neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        950: '#0a0a0a',
    },

    // Accent colors
    accent: {
        red: '#ef4444',
        blue: '#3b82f6',
        yellow: '#eab308',
    },

    // Chart colors
    chart: {
        primary: '#22c55e', // primary-500
        secondary: '#f97316', // secondary-500
        newUsers: '#eab308', // yellow
        oldUsers: '#3b82f6', // blue
    },
};

export default colors;

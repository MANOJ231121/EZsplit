/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyan primary. The scale is shifted one step darker than Tailwind's
        // stock cyan so brand-500 keeps legible white text (3.5:1) for buttons.
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#0891b2',
          600: '#0e7490',
          700: '#155e75',
          800: '#164e63',
          900: '#083344',
        },
        owe: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444', // Red for user owing money
          600: '#dc2626',
        },
        owed: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981', // Green for user owed money
          600: '#059669',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'brand-glow': '0 8px 25px -4px rgba(8, 145, 178, 0.35)',
        'brand-glow-lg': '0 18px 40px -12px rgba(8, 145, 178, 0.45)',
      },
      scale: {
        98: '0.98',
      },
      // Device safe areas (notch / home indicator / rounded corners in landscape).
      spacing: {
        'safe-t': 'env(safe-area-inset-top, 0px)',
        'safe-b': 'env(safe-area-inset-bottom, 0px)',
        'safe-l': 'env(safe-area-inset-left, 0px)',
        'safe-r': 'env(safe-area-inset-right, 0px)',
      },
      // Minimum comfortable thumb target (Apple HIG 44pt / Material 48dp).
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        'sheet-up': 'sheet-up 0.28s cubic-bezier(0.32, 0.72, 0, 1) both',
        'fade-in': 'fade-in 0.2s ease-out both',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
}

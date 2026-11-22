/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /*
         * Warm neutral ramp. Everything that used to read as cool blue-grey
         * (slate-50 → slate-900) now resolves to the warm paper / charcoal
         * tones from the Split Bill reference design. Because these are theme
         * tokens, every opacity and state variant (`bg-slate-800/60`,
         * `hover:bg-slate-200`, ...) picks them up automatically.
         */
        slate: {
          50: '#F7F5F2',
          100: '#F1EDE8',
          200: '#E7E0D8',
          300: '#D7CFC5',
          400: '#A79A90',
          500: '#87776C',
          600: '#6B5A50',
          700: '#5E443A',
          800: '#2A1E18',
          900: '#0F0B0A',
          950: '#070504',
        },
        /*
         * Primary orange. 400 is the vivid #FE860A accent from the reference;
         * 500/600 are stepped down so white button labels stay legible.
         */
        brand: {
          50: '#FFF4E9',
          100: '#FFE6CC',
          200: '#FFCB99',
          300: '#FFB066',
          400: '#FE860A',
          500: '#D96A00',
          600: '#B85C05',
          700: '#8E4708',
          800: '#6D3809',
          900: '#4F2A08',
        },
        /*
         * The old cyan-ish surfaces become warm sand / amber washes, keeping
         * informational chips distinct from the primary orange without
         * dragging a cold blue tone into the palette.
         */
        cyan: {
          50: '#FFF7EC',
          100: '#FFF0D7',
          200: '#FFE1AF',
          300: '#FFC97D',
          400: '#F5A94F',
          500: '#D98A2B',
          600: '#B56C16',
          700: '#8F5312',
          800: '#6F4210',
          900: '#5A370F',
        },
        owe: {
          50: '#FEF2F0',
          100: '#FEE2DE',
          500: '#E24A3A',
          600: '#C93B2C',
        },
        owed: {
          50: '#ECFDF7',
          100: '#D1FAE9',
          500: '#0E9F72',
          600: '#0B7D5A',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 11, 10, 0.06), 0 2px 6px -1px rgba(15, 11, 10, 0.03)',
        'card': '0 10px 30px -5px rgba(15, 11, 10, 0.10), 0 4px 12px -2px rgba(15, 11, 10, 0.04)',
        'brand-glow': '0 8px 24px -6px rgba(254, 134, 10, 0.45)',
        'brand-glow-lg': '0 18px 40px -12px rgba(254, 134, 10, 0.50)',
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

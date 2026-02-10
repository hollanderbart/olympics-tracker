/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        oranje: {
          DEFAULT: '#FF6600',
          50: '#FFF3E6',
          100: '#FFE0B3',
          200: '#FFCC80',
          300: '#FFB74D',
          400: '#FF9E1A',
          500: '#FF6600',
          600: '#E55C00',
          700: '#CC5200',
          800: '#993D00',
          900: '#662900',
        },
        gold: '#FFD700',
        silver: '#C0C0C0',
        bronze: '#CD7F32',
        dark: {
          DEFAULT: '#0a0a12',
          100: '#12141e',
          200: '#1a1c28',
          300: '#22242f',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'Helvetica Neue', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 1.5s ease-in-out infinite',
        'slide-in': 'slideIn 0.6s ease-out',
        'slide-in-delay': 'slideIn 0.6s ease-out 0.15s both',
        shimmer: 'shimmer 3s linear infinite',
      },
      keyframes: {
        slideIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

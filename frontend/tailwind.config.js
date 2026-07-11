/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: '#080A10',
          surface: '#111420',
          surface2: '#1B2030',
          border: 'rgba(255, 255, 255, 0.08)',
          primary: '#1A73E8',
          'primary-light': '#388BFD',
          'primary-dark': '#0D51B3',
          accent: '#FBBC04',
          'accent-dark': '#C9A800',
          success: '#34A853',
          warning: '#FBBC05',
          danger: '#EA4335',
          text: '#F0F4FA',
          muted: '#8B949E',
          card: '#131722',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0,102,204,0.5)' },
          '50%': { boxShadow: '0 0 24px rgba(0,102,204,0.9)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'nexus-gradient': 'linear-gradient(135deg, #080A10 0%, #111420 50%, #1B2030 100%)',
        'primary-gradient': 'linear-gradient(135deg, #0D51B3 0%, #1A73E8 50%, #388BFD 100%)',
        'accent-gradient': 'linear-gradient(135deg, #C9A800 0%, #FBBC04 50%, #FDD663 100%)',
        'card-gradient': 'linear-gradient(135deg, #111420 0%, #1B2030 100%)',
        'hero-gradient': 'radial-gradient(ellipse at center, #1B2030 0%, #080A10 70%)',
      },
      boxShadow: {
        nexus: '0 4px 24px rgba(26,115,232,0.15)',
        'nexus-lg': '0 8px 48px rgba(26,115,232,0.25)',
        accent: '0 4px 24px rgba(251,188,4,0.15)',
        card: '0 4px 20px rgba(0,0,0,0.5)',
        glow: '0 0 24px rgba(26,115,232,0.45)',
      },
    },
  },
  plugins: [],
};

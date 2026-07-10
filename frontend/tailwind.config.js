/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: '#050A18',
          surface: '#0D1B2E',
          surface2: '#1A2744',
          border: '#1E3A5F',
          primary: '#0066CC',
          'primary-light': '#0088FF',
          'primary-dark': '#004E9A',
          accent: '#FFD700',
          'accent-dark': '#C9A800',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          text: '#F0F6FF',
          muted: '#8899AA',
          card: '#0F1E35',
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
        'nexus-gradient': 'linear-gradient(135deg, #050A18 0%, #0D1B2E 50%, #1A2744 100%)',
        'primary-gradient': 'linear-gradient(135deg, #004E9A 0%, #0066CC 50%, #0088FF 100%)',
        'accent-gradient': 'linear-gradient(135deg, #C9A800 0%, #FFD700 50%, #FFE84D 100%)',
        'card-gradient': 'linear-gradient(135deg, #0F1E35 0%, #1A2744 100%)',
        'hero-gradient': 'radial-gradient(ellipse at center, #0D1B2E 0%, #050A18 70%)',
      },
      boxShadow: {
        nexus: '0 4px 24px rgba(0,102,204,0.15)',
        'nexus-lg': '0 8px 48px rgba(0,102,204,0.25)',
        accent: '0 4px 24px rgba(255,215,0,0.15)',
        card: '0 2px 16px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(0,136,255,0.4)',
      },
    },
  },
  plugins: [],
};

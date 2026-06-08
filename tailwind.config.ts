import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F1B2D',
          50: '#1a2d45',
          100: '#0F1B2D',
          900: '#080f1a',
        },
        brand: {
          orange: '#FF6B1A',
          'orange-hover': '#e55a0f',
          'orange-light': '#fff1eb',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['DM Serif Display', 'Georgia', 'serif'],
      },
      // Premium layered shadows for depth without heaviness
      boxShadow: {
        soft:     '0 1px 3px rgba(15,27,45,0.04), 0 1px 2px rgba(15,27,45,0.06)',
        card:     '0 2px 8px rgba(15,27,45,0.05), 0 1px 3px rgba(15,27,45,0.04)',
        'card-hover': '0 12px 28px rgba(15,27,45,0.12), 0 4px 10px rgba(15,27,45,0.06)',
        premium:  '0 10px 40px rgba(15,27,45,0.10)',
        cta:      '0 6px 16px rgba(255,107,26,0.28)',
        'cta-hover': '0 10px 24px rgba(255,107,26,0.38)',
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
        smooth:  'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        marquee:     'marquee 30s linear infinite',
      },
      keyframes: {
        marquee:   { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideUp:   { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeInUp:  { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,107,26,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(255,107,26,0)' } },
      },
    },
  },
  plugins: [],
};

export default config;

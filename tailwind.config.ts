import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        snow:   'var(--color-snow)',
        mist:   'var(--color-mist)',
        cloud:  'var(--color-cloud)',
        ink:    'var(--color-ink)',
        slate:  'var(--color-slate)',
        fog:    'var(--color-fog)',
        wolt: {
          light:  '#E8F4FD',
          base:   '#0099E5',
          deep:   '#0077B6',
          darker: '#005A8E',
        },
        emerald: '#10B981',
        amber:   '#F59E0B',
        coral:   '#EF4444',
      },
      fontFamily: {
        sans:    ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body:    ['Nunito', 'system-ui', 'sans-serif'],
      },
      maxWidth: { mobile: '430px' },
      spacing: {
        nav:    '64px',
        'safe-b': 'calc(1rem + env(safe-area-inset-bottom, 0px))',
        'safe-t': 'calc(1rem + env(safe-area-inset-top, 0px))',
      },
      borderRadius: { '3xl': '1.5rem', '4xl': '2rem' },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        ios:    'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      boxShadow: {
        card:        '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover':'0 8px 24px rgba(0,0,0,0.12)',
        wolt:        '0 4px 16px rgba(0,153,229,0.35)',
        sheet:       '0 -8px 32px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
} satisfies Config
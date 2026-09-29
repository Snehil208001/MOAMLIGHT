/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: '#C06C47',
          dark: '#B3542B',
          light: '#D98967',
        },
        'warm-linen': {
          DEFAULT: '#FAF7F2',
          light: '#FCFAF7',
        },
        'warm-cream': {
          DEFAULT: '#F9F6F0',
          soft: '#FAF7F2',
          surface: '#F0ECE1',
        },
        charcoal: {
          DEFAULT: '#1A1A1A',
          dark: '#121212',
          deep: '#0F0E0D',
          muted: '#7A6E67',
          light: '#9E948E',
        },
        sage: {
          DEFAULT: '#7D8471',
          light: '#EBECE8',
          dark: '#5F6654',
        },
        amber: {
          DEFAULT: '#FF8C00',
          glow: '#FFA500',
          soft: '#FFB84D',
          gold: '#D4A373',
        },
        'amber-gold': {
          DEFAULT: '#D4A373',
          light: '#E5C29F',
          dark: '#B88252',
        },
        'warm-border': {
          DEFAULT: '#E8DDD0',
          dark: '#3A3532',
        },
        lumiere: {
          'day-bg': '#FAFAF9',
          'day-surface': '#F5F0EB',
          'day-fg': '#1C1917',
          'day-fg-muted': '#78716C',
          'day-accent': '#A16207',
          'day-accent-hover': '#854D0E',
          'day-border': '#D6D3D1',
          'night-bg': '#0C0A09',
          'night-surface': '#1C1917',
          'night-fg': '#FAFAF9',
          'night-fg-muted': '#A8A29E',
          'night-accent': '#D97706',
          'night-border-glass': 'rgba(255,255,255,0.08)',
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'var(--font-cormorant)', 'Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-montserrat)', 'var(--font-inter)', 'var(--font-plus-jakarta)', 'Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 10px 25px -5px rgba(38, 33, 30, 0.06), 0 8px 10px -6px rgba(38, 33, 30, 0.04)',
        'warm-lg': '0 20px 30px -8px rgba(38, 33, 30, 0.08), 0 10px 15px -5px rgba(38, 33, 30, 0.05)',
        'warm-inner': 'inset 0 2px 4px 0 rgba(38, 33, 30, 0.06)',
        'amber-glow': '0 0 25px rgba(255, 140, 0, 0.4), 0 0 50px rgba(255, 140, 0, 0.15)',
        'amber-glow-card': '0 25px 50px -12px rgba(255, 140, 0, 0.38)',
        'amber-glow-hero': '0 0 60px rgba(255, 140, 0, 0.3)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
      aspectRatio: {
        '4/5': '4 / 5',
      },
    },
  },
  plugins: [],
};

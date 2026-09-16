import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        titan: {
          bg:       '#07070E',
          surface:  '#0F0F1A',
          card:     '#161622',
          border:   '#23232E',
          accent:   '#FF5722',
          'accent-2': '#FF8A50',
          gold:     '#FFB300',
          green:    '#00C853',
          red:      '#FF1744',
          text:     '#F0F0F8',
          muted:    '#6B6B8A',
          subtle:   '#3A3A50',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':       'glow 2s ease-in-out infinite',
        'slide-up':   'slideUp 0.3s ease-out',
        'fade-in':    'fadeIn 0.4s ease-out',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 87, 34, 0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(255, 87, 34, 0.6)' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-titan':       'linear-gradient(135deg, #FF5722 0%, #FF8A50 100%)',
        'gradient-titan-radial':'radial-gradient(ellipse at top, #1A0F0A 0%, #07070E 70%)',
        'gradient-card':        'linear-gradient(135deg, #161622 0%, #1E1E2E 100%)',
      },
      boxShadow: {
        'titan':    '0 0 30px rgba(255, 87, 34, 0.2)',
        'titan-lg': '0 0 60px rgba(255, 87, 34, 0.3)',
        'card':     '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-lg':  '0 8px 40px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}

export default config

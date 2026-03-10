/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        tg: {
          bg: 'var(--tg-theme-bg-color, #ffffff)',
          text: 'var(--tg-theme-text-color, #000000)',
          hint: 'var(--tg-theme-hint-color, #999999)',
          link: 'var(--tg-theme-link-color, #2481cc)',
          button: 'var(--tg-theme-button-color, #2481cc)',
          'button-text': 'var(--tg-theme-button-text-color, #ffffff)',
          secondary: 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
        },
        site: {
          bg: 'var(--site-bg)',
          elevated: 'var(--site-bg-elevated)',
          card: 'var(--site-bg-card)',
          border: 'var(--site-border)',
          text: 'var(--site-text)',
          muted: 'var(--site-text-muted)',
          dim: 'var(--site-text-dim)',
          accent: 'var(--site-accent)',
          'accent-hover': 'var(--site-accent-hover)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(42, 171, 238, 0.1)' },
          '50%': { boxShadow: '0 0 30px rgba(42, 171, 238, 0.25)' },
        },
      },
    },
  },
  plugins: [],
};
